﻿// Copyright © 2015-2023 Oleksandr Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.IO;
using System.Threading.Tasks;
using System.Web;
using System.Collections.Generic;
using System.Globalization;
using System.Text;

using Newtonsoft.Json;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using A2v10.Interop;
using A2v10.Interop.AzureStorage;
using A2v10.Javascript;
using System.Text.RegularExpressions;

namespace A2v10.Request;

public partial class BaseController
{
	public async Task SaveFiles(String pathInfo, HttpFileCollectionBase files, ExpandoObject formParams, Action<ExpandoObject> setParams, TextWriter writer)
	{
		var rm = await RequestModel.CreateFromBaseUrl(_host, pathInfo);
		var ru = rm.GetFile();

		ExpandoObject savePrms = new();
		setParams?.Invoke(savePrms);
		savePrms.Append(formParams);
		savePrms.AppendIfNotExists(ru.parameters);

		ru.CheckPermissions(_userStateManager?.GetUserPermissions(), _host.IsDebugConfiguration);

		switch (ru.type)
		{
			case RequestFileType.clr:
				{
					if (String.IsNullOrEmpty(ru.clrType))
						throw new RequestModelException($"'clrType' is required for '{rm.ModelFile}' file");
					savePrms.Set("Id", ru.Id);
					savePrms.Set("Stream", files[0].InputStream);
					savePrms.Set("FileName", files[0].FileName);
					var result = await DoUploadClr(ru, savePrms);
					writer.Write(JsonConvert.SerializeObject(result, JsonHelpers.ConfigSerializerSettings(_host.IsDebugConfiguration)));
				}
				break;
			case RequestFileType.parse:
				{
					savePrms.Set("Id", ru.Id);
					ExpandoObject dm = null;
					var fileName = Path.GetFileName(files[0].FileName);
					switch (ru.parse)
					{
						case RequestFileParseType.auto:
							var ext = Path.GetExtension(files[0].FileName).ToLowerInvariant();
							switch (ext)
							{
								case ".xlsx":
									dm = await SaveExcel(ru, files[0].InputStream, savePrms, fileName);
									break;
								case ".csv":
									dm = await SaveFlat("csv", ru, files[0].InputStream, savePrms);
									break;
								case ".dbf":
									dm = await SaveFlat("dbf", ru, files[0].InputStream, savePrms);
									break;
								case ".xml":
									dm = await SaveFlat("xml", ru, files[0].InputStream, savePrms);
									break;
								case ".json":
									dm = await SaveJson(ru, files[0].InputStream, savePrms);
									break;
								default:
									throw new RequestModelException($"'{ext}' file not yet supported");
							}
							break;
						case RequestFileParseType.excel:
						case RequestFileParseType.xlsx:
							dm = await SaveExcel(ru, files[0].InputStream, savePrms, fileName);
							break;
						case RequestFileParseType.csv:
							dm = await SaveFlat("csv", ru, files[0].InputStream, savePrms);
							break;
						case RequestFileParseType.dbf:
							dm = await SaveFlat("dbf", ru, files[0].InputStream, savePrms);
							break;
						case RequestFileParseType.xml:
							dm = await SaveFlat("xml", ru, files[0].InputStream, savePrms);
							break;
						case RequestFileParseType.json:
							dm = await SaveJson(ru, files[0].InputStream, savePrms);
							break;
					}
					if (dm != null)
						WriteExpandoObject(dm, writer);
				}
				break;
			case RequestFileType.sql:
				{
					savePrms.Set("Id", ru.Id);
					var result = await SaveFilesSql(ru, savePrms, files);
					writer.Write(JsonConvert.SerializeObject(result, JsonHelpers.ConfigSerializerSettings(_host.IsDebugConfiguration)));
				}
				break;
			case RequestFileType.azureBlob:
				{
					savePrms.Set("Id", ru.Id);
					var result = await SaveFilesAzureStorage(ru, savePrms, files);
					writer.Write(JsonConvert.SerializeObject(result, JsonHelpers.ConfigSerializerSettings(_host.IsDebugConfiguration)));
				}
				break;
		}
	}

	async Task<ExpandoObject> SaveExcel(RequestFile ru, Stream stream, ExpandoObject prms, String fileName)
	{
		if (ru.availableModels != null)
		{
            using var xp = new ExcelParser();
            if (fileName != null)
                prms.Set("FileName", fileName);
            var epr = xp.CreateDataModel(stream);
            String cols = String.Join("|", epr.Columns);
            var fm = ru.FindModel(null, cols)
                ?? throw new RequestModelException($"There is no model for columns='{cols}'");
            prms.Append(fm.parameters);
            var dm = await _dbContext.SaveModelAsync(fm.CurrentSource(ru), fm.UpdateProcedure(ru), epr.Data, prms, null, ru.commandTimeout);
            return dm?.Root;
        }
		else if (String.IsNullOrEmpty(ru.CurrentModel))
		{
            using var xp = new ExcelParser();
            var epr = xp.CreateDataModel(stream);
            return epr.Data;
        }
		else
		{
            using var xp = new ExcelParser();
            xp.ErrorMessage = "UI:@[Error.FileFormatException]";
            IDataModel dm = await _dbContext.SaveModelAsync(ru.CurrentSource, ru.UpdateProcedure, null, prms, (table) =>
            {
                return xp.ParseFile(stream, table).Data;
            });
            return dm?.Root;
        }
	}

	async Task<ExpandoObject> SaveJson(RequestFile rf, Stream stream, ExpandoObject prms)
	{
		String json = null;
		if (rf.zip)
		{
			json = ZipUtils.DecompressText(stream);
		}
		else
		{
            using var sr = new StreamReader(stream);
            json = sr.ReadToEnd();
        }
		var data = JsonConvert.DeserializeObject<ExpandoObject>(json);
		var res = await _dbContext.SaveModelAsync(rf.CurrentSource, rf.UpdateProcedure, data, prms, null, rf.commandTimeout);
		return res.Root;
	}

	async Task<ExpandoObject> SaveFlat(String format, RequestFile rf, Stream stream, ExpandoObject prms)
	{
		if (_externalDataProvider == null)
			throw new ArgumentNullException(nameof(_externalDataProvider));
		IFormatProvider formatProvider = CultureInfo.InvariantCulture;
		var rdr = _externalDataProvider.GetReader(format, null, null);
		if (String.IsNullOrEmpty(rf.CurrentModel))
		{
			return rdr.CreateDataModel(stream);
		}
		else
		{
			var dm = await _dbContext.SaveModelAsync(rf.CurrentSource, rf.UpdateProcedure, null, prms, 
				(table) =>
				{
					if (!String.IsNullOrEmpty(rf.locale))
						table.FormatProvider = CultureInfo.GetCultureInfo(rf.locale);
					return rdr.ParseFile(stream, table);
				}, 
				rf.commandTimeout
			);
			return dm?.Root;
		}
	}

	async Task<Object> DoUploadClr(RequestFile ru, ExpandoObject prms)
	{
		var invoker = new ClrInvoker();
		Object result;
		if (ru.async)
			result = await invoker.InvokeAsync(ru.clrType, prms);
		else
			result = invoker.Invoke(ru.clrType, prms);
		return result;
	}

	async Task<Object> SaveFilesSql(RequestFile ru, ExpandoObject prms, HttpFileCollectionBase files)
	{
		AttachmentUpdateInfo ii = new()
		{
			UserId = prms.Get<Int64>("UserId"),
			Key = prms.Get<String>("Key"),
			Id = prms.Get<String>("Id") /*as string!*/
		};
		if (_host.IsMultiTenant)
			ii.TenantId = prms.Get<Int32>("TenantId");

		ImageSettings compress = ru.imageCompress;

		var resultList = new List<AttachmentUpdateIdToken>();
		for (Int32 i = 0; i < files.Count; i++)
		{
			HttpPostedFileBase file = files[i];
			ii.Name = Path.GetFileName(file.FileName);
			ii.Mime = file.ContentType;
			if (compress != null && IsImageForCompress(compress, file))
				ii.Stream = CompressImage(file.InputStream, file.ContentType, compress.quality);
			else
				ii.Stream = file.InputStream;
			var result = await _dbContext.ExecuteAndLoadAsync<AttachmentUpdateInfo, AttachmentUpdateOutput>(ru.CurrentSource, ru.FileProcedureUpdate, ii);
			resultList.Add(new AttachmentUpdateIdToken()
				{
					Id = result.Id,
					Name = ii.Name,
					Mime = ii.Mime,
					Token = result != null ? _tokenProvider.GenerateToken(result.Token) : null
				}
			);
		}
		return resultList;
	}

	String ResolveAzureContainer(String container)
	{
		// [path_1/]((Segment ?? DEFAULT_SEGMENT))[path_2]
		if (String.IsNullOrEmpty(container))
			return String.Empty;
		container = container.Trim();

		const String pattern = @"(.*)\(\(Segment\s*?\?\?\s*(.*)\s*?\)\)(.*)";
		var match = Regex.Match(container, pattern, RegexOptions.IgnorePatternWhitespace);
		if (match.Success && match.Groups.Count == 4)
		{
			var segment = _host.UserSegment;
			if (String.IsNullOrEmpty(segment))
				segment = match.Groups[2].Value;
			return $"{match.Groups[1].Value}{segment}{match.Groups[3]}";
		}	
		return container;
	}

	async Task<Object> SaveFilesAzureStorage(RequestFile ru, ExpandoObject prms, HttpFileCollectionBase files)
	{
		AttachmentUpdateInfo ii = new()
		{
			UserId = prms.Get<Int64>("UserId")
		};
		if (_host.IsMultiTenant)
			ii.TenantId = prms.Get<Int32>("TenantId");
		var resultList = new List<AttachmentUpdateIdToken>();
		var azureClient = new AzureStorageRestClient();

		for (Int32 i = 0; i < files.Count; i++)
		{
			HttpPostedFileBase file = files[i];
			var blobName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";

			var azureStream = file.InputStream;
			if (ru.imageCompress != null && IsImageForCompress(ru.imageCompress, file)) {
				azureStream = CompressImage(file.InputStream, file.ContentType, ru.imageCompress.quality);
			}

			var container = ResolveAzureContainer(ru.container).ToLowerInvariant();

			await azureClient.Put(ru.azureSource, container, blobName, azureStream, azureStream.Length);

			ii.Name = Path.GetFileName(file.FileName);
			ii.Mime = file.ContentType;
			ii.Stream = null;
			ii.BlobName = $"{container}/{blobName}";
			var result = await _dbContext.ExecuteAndLoadAsync<AttachmentUpdateInfo, AttachmentUpdateOutput>(ru.CurrentSource, ru.FileProcedureUpdate, ii);
			resultList.Add(new AttachmentUpdateIdToken()
			{
				Id = result.Id,
				Name = ii.Name,
				Mime = ii.Mime,
				Token = result != null ? _tokenProvider.GenerateToken(result.Token) : null
			}
			);
		}
		return resultList;
	}

	public async Task<AttachmentInfo> LoadFileGet(String pathInfo, Action<ExpandoObject> setParams, String token)
	{
		var rm = await RequestModel.CreateFromBaseUrl(_host, pathInfo);
		var ru = rm.GetFile();

		ru.CheckPermissions(_userStateManager?.GetUserPermissions(), _host.IsDebugConfiguration);

		ExpandoObject loadPrms = new();
		setParams?.Invoke(loadPrms);
		loadPrms.Set("Id", ru.Id);
		loadPrms.RemoveKeys("export,Export,token,Token");

		switch (ru.type)
		{
			case RequestFileType.json:
				var dm = await _dbContext.LoadModelAsync(ru.CurrentSource, ru.LoadProcedure, loadPrms);
				var settings = JsonHelpers.StandardSerializerSettings;
				settings.Converters.Add(new IgnoreNullValueExpandoObjectConverter());
				var json = JsonConvert.SerializeObject(dm.Root, settings);
				Byte[] stream = null;
				String mime = MimeTypes.Application.Json;
				if (ru.zip) 
				{
					mime = MimeTypes.Application.Zip;
					stream = ZipUtils.CompressText(json);
				} else {
					stream = Encoding.UTF8.GetBytes(json);
				}
				return new AttachmentInfo()
				{
					SkipToken = true,
					Mime = mime,
					Stream = stream,
					Name = ru.outputFileName
				};
			case RequestFileType.sql:
			case RequestFileType.azureBlob:
				{
					if (token == null)
						throw new InvalidOperationException("There is no access token for image");
					var ai = await _dbContext.LoadAsync<AttachmentInfo>(ru.CurrentSource, ru.FileProcedureLoad, loadPrms);
					if (!String.IsNullOrEmpty(ai.BlobName))
					{
						var azureClient = new AzureStorageRestClient();
						var blobName = Path.GetFileName(ai.BlobName);
						var container = Path.GetDirectoryName(ai.BlobName);
						ai.Stream = await azureClient.Get(ru.azureSource, container, blobName);
					}
					return ai;
				}
			case RequestFileType.clr:
				{
                    var invoker = new ClrInvoker();
                    Object result;
                    if (ru.async)
                        result = await invoker.InvokeAsync(ru.clrType, loadPrms);
                    else
                        result = invoker.Invoke(ru.clrType, loadPrms);

                    if (result is not ServerCommandResult srres)
                        throw new InvalidOperationException($"Invoke for file should return the type 'ServerCommandResult'");
                    return new AttachmentInfo()
					{
						Mime = srres.ContentType,
						Stream = srres.Stream,
                        SkipToken =  true,
						Name = srres.FileName
                    };
                }
            default:
				throw new InvalidOperationException($"Invalid type for file: '{ru.type}'");
		}
	}
}

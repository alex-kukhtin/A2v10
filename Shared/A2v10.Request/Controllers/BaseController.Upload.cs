// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.IO;
using System.Threading.Tasks;
using System.Web;
using System.Collections.Generic;

using Newtonsoft.Json;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using A2v10.Interop;

namespace A2v10.Request
{
	public partial class BaseController
	{
		public async Task SaveFiles(String pathInfo, HttpFileCollectionBase files, Action<ExpandoObject> setParams, TextWriter writer)
		{
			var rm = await RequestModel.CreateFromBaseUrl(_host, Admin, pathInfo);
			ExpandoObject prms = new ExpandoObject();
			var ru = rm.GetFile();

			ExpandoObject savePrms = new ExpandoObject();
			setParams?.Invoke(savePrms);
			savePrms.AppendIfNotExists(ru.parameters);

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
						writer.Write(JsonConvert.SerializeObject(result, JsonHelpers.StandardSerializerSettings));
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
						}
						if (dm != null)
							WriteExpandoObject(dm, writer);
					}
					break;
				case RequestFileType.sql:
					{
						savePrms.Set("Id", ru.Id);
						var result = await SaveFilesSql(ru, savePrms, files);
						writer.Write(JsonConvert.SerializeObject(result, JsonHelpers.StandardSerializerSettings));
					}
					break;
			}
		}

		async Task<ExpandoObject> SaveExcel(RequestFile ru, Stream stream, ExpandoObject prms, String fileName)
		{
			if (ru.availableModels != null)
			{
				using (var xp = new ExcelParser())
				{
					if (fileName != null)
						prms.Set("FileName", fileName);
					var epr = xp.CreateDataModel(stream);
					String cols = String.Join("|", epr.Columns);
					var fm = ru.FindModel(null, cols);
					if (fm == null)
						throw new RequestModelException($"There is no model for columns='{cols}'");
					await _dbContext.SaveModelAsync(fm.CurrentSource(ru), fm.UpdateProcedure(ru), epr.Data, prms);
					return epr.Data;
				}
			}
			else if (String.IsNullOrEmpty(ru.CurrentModel))
			{
				using (var xp = new ExcelParser())
				{
					var epr = xp.CreateDataModel(stream);
					return epr.Data;
				}
			}
			else
			{
				using (var xp = new ExcelParser())
				{
					xp.ErrorMessage = "UI:@[Error.FileFormatException]";
					IDataModel dm = await _dbContext.SaveModelAsync(ru.CurrentSource, ru.UpdateProcedure, null, prms, (table) =>
					{
						return xp.ParseFile(stream, table).Data;
					});
					return dm?.Root;
				}
			}
		}

		async Task<ExpandoObject> SaveFlat(String format, RequestFile ru, Stream stream, ExpandoObject prms)
		{
			if (_externalDataProvider == null)
				throw new ArgumentNullException(nameof(_externalDataProvider));
			var rdr = _externalDataProvider.GetReader(format, null, null);
			if (String.IsNullOrEmpty(ru.CurrentModel))
			{
				return rdr.CreateDataModel(stream);
			}
			else
			{
				var dm = await _dbContext.SaveModelAsync(ru.CurrentSource, ru.UpdateProcedure, null, prms, (table) =>
				{
					return rdr.ParseFile(stream, table);
				});
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
			AttachmentUpdateInfo ii = new AttachmentUpdateInfo()
			{
				UserId = prms.Get<Int64>("UserId")
			};
			if (_host.IsMultiTenant)
				ii.TenantId = prms.Get<Int32>("TenantId");
			var resultList = new List<AttachmentUpdateResult>();
			for (Int32 i = 0; i < files.Count; i++)
			{
				HttpPostedFileBase file = files[i];
				ii.Name = Path.GetFileName(file.FileName);
				ii.Mime = file.ContentType;
				ii.Stream = file.InputStream;
				var result = await _dbContext.ExecuteAndLoadAsync<AttachmentUpdateInfo, AttachmentUpdateResult>(ru.CurrentSource, ru.FileProcedureUpdate, ii);
				resultList.Add(result);
			}
			return resultList;
		}

		public async Task<AttachmentInfo> LoadFileGet(String pathInfo, Action<ExpandoObject> setParams)
		{
			var rm = await RequestModel.CreateFromBaseUrl(_host, Admin, pathInfo);
			var ru = rm.GetFile();

			ExpandoObject loadPrms = new ExpandoObject();
			setParams?.Invoke(loadPrms);
			loadPrms.Set("Id", ru.Id);
			loadPrms.RemoveKeys("export,Export");

			switch (ru.type)
			{
				case RequestFileType.sql:
					return await _dbContext.LoadAsync<AttachmentInfo>(ru.CurrentSource, ru.FileProcedureLoad, loadPrms);
				default:
					throw new InvalidOperationException("The 'POST' method is not allowed for requested url");
			}
		}
	}
}

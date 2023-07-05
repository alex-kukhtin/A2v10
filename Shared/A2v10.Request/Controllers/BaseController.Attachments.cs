// Copyright © 2015-2023 Oleksandr Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.IO;
using System.Threading.Tasks;
using System.Web;
using System.Collections.Generic;

using A2v10.Infrastructure;
using System.Net.Mime;
using System.Drawing;
using System.Drawing.Imaging;
using A2v10.Interop.AzureStorage;

namespace A2v10.Request;

public class AttachmentInfo
{
	public String Mime { get; set; }
	public String Name { get; set; }
	public Guid Token { get; set; }
	public Byte[] Stream { get; set; }
	public String BlobName { get; set; }

	public Boolean SkipToken { get; set; }
	public Boolean CheckToken => !SkipToken;
}

public class AttachmentUpdateInfo
{
	public Int32? TenantId { get; set; }
	public Int64? CompanyId { get; set; }
	public Int64 UserId { get; set; }
	public String Key { get; set; }
	public Object Id { get; set; }
	public String Mime { get; set; }
	public String Name { get; set; }
	public Stream Stream { get; set; }
	public String BlobName { get; set; }
}

public class AttachmentUpdateOutput
{
	public Object Id { get; set; }
	public Guid Token { get; set; }
}

public class AttachmentUpdateIdToken
{
	public Object Id { get; set; }
	public String Mime { get; set; }
	public String Name { get; set; }
	public String Token { get; set; }
}

public class ReturnSignatureInfo
{
	public Int64 Id { get; set; }
}

public class SignatureInfo
{
	public Byte[] Stream { get; set; }
}

public partial class BaseController
{
	public async Task<AttachmentInfo> DownloadAttachment(String pathInfo, Action<ExpandoObject> setParams, String suffix = "Load")
	{
		var rm = await RequestModel.CreateFromBaseUrl(_host, pathInfo);
		// [{source}].[{schema}].[{base}.{key}.Load]
		ExpandoObject prms = new ExpandoObject();
		setParams?.Invoke(prms);
		String key = rm.ModelAction.ToPascalCase();
		prms.Set("Id", rm._id);
		prms.Set("Key", key);
		String procedure = $"[{rm.schema}].[{rm.model}.{key}.{suffix}]";
		var ai = await _dbContext.LoadAsync<AttachmentInfo>(rm.CurrentSource, procedure, prms);
		if (!String.IsNullOrEmpty(ai.BlobName))
		{
			var azureClient = new AzureStorageRestClient();
			ai.Stream = await azureClient.GetBlob(ai.BlobName);
		}
		return ai;

	}

	public async Task<SignatureInfo> DownloadSignature(String pathInfo, Action<ExpandoObject> setParams)
	{
		var rm = await RequestModel.CreateFromBaseUrl(_host, pathInfo);
		// [{source}].[{schema}].[{base}.{key}.LoadSignature]
		ExpandoObject prms = new ExpandoObject();
		setParams?.Invoke(prms);
		String key = rm.ModelAction.ToPascalCase();
		prms.Set("Id", rm._id);
		prms.Set("Key", key);
		String procedure = $"[{rm.schema}].[{rm.model}.{key}.LoadSignature]";
		return await _dbContext.LoadAsync<SignatureInfo>(rm.CurrentSource, procedure, prms);
	}

	public async Task<ReturnSignatureInfo> SaveSignature(String pathInfo, ExpandoObject prms)
	{
		var rm = await RequestModel.CreateFromBaseUrl(_host, pathInfo);
		// [{source}].[{schema}].[{base}.{key}.SaveSignature]
		String key = rm.ModelAction.ToPascalCase();
		prms.Set("Id", rm._id);
		prms.Set("Key", key);
		String procedure = $"[{rm.schema}].[{rm.model}.{key}.SaveSignature]";
		return await _dbContext.LoadAsync<ReturnSignatureInfo>(rm.CurrentSource, procedure, prms);
	}

	public async Task<IList<AttachmentUpdateIdToken>> SaveAttachments(Int32 tenantId, String pathInfo, HttpFileCollectionBase files, Int64 userId, Int64 companyId)
	{
		var rm = await RequestModel.CreateFromBaseUrl(_host, pathInfo);
		ExpandoObject prms = new ExpandoObject();
		String key = rm.ModelAction.ToPascalCase();
		String procedure = $"[{rm.schema}].[{rm.model}.{key}.Update]";

		rm.ImageSettings.TryGetValue(key, out var imageSettings);

		AttachmentUpdateInfo ii = new AttachmentUpdateInfo
		{
			UserId = userId,
			Id = rm._id,
			Key = key
		};
		if (_host.IsMultiTenant)
			ii.TenantId = tenantId;
		if (_host.IsMultiCompany)
			ii.CompanyId = companyId;
		var retList = new List<AttachmentUpdateIdToken>();
		for (Int32 i = 0; i < files.Count; i++)
		{
			HttpPostedFileBase file = files[i];
			ii.Mime = file.ContentType;
			ii.Name = Path.GetFileName(file.FileName);
			ii.Stream = CompressImage(imageSettings, file);
			var aout = await _dbContext.ExecuteAndLoadAsync<AttachmentUpdateInfo, AttachmentUpdateOutput>(rm.CurrentSource, procedure, ii);
			retList.Add(new AttachmentUpdateIdToken()
			{
				Id = aout.Id,
				Name = ii.Name,
				Mime = ii.Mime,
				Token = _tokenProvider.GenerateToken(aout.Token)
			});
		}
		return retList;
	}

	public async Task<IList<AttachmentUpdateIdToken>> SaveAttachmentsMime(Int32 tenantId, String pathInfo, HttpFileCollectionBase files, Int64 userId, Int64 companyId)
	{
		var rm = await RequestModel.CreateFromBaseUrl(_host, pathInfo);
		ExpandoObject prms = new ExpandoObject();
		String key = rm.ModelAction.ToPascalCase();
		String procedure = $"[{rm.schema}].[{rm.model}.{key}.Update]";
		AttachmentUpdateInfo ii = new AttachmentUpdateInfo
		{
			UserId = userId,
			Id = rm._id,
			Key = key
		};
		if (_host.IsMultiTenant)
			ii.TenantId = tenantId;
		if (_host.IsMultiCompany)
			ii.CompanyId = companyId;
		var retList = new List<AttachmentUpdateIdToken>();
		for (Int32 i = 0; i < files.Count; i++)
		{
			HttpPostedFileBase file = files[i];
			ii.Mime = file.ContentType;
			ii.Name = Path.GetFileName(file.FileName);
			ii.Stream = file.InputStream;
			var aout = await _dbContext.ExecuteAndLoadAsync<AttachmentUpdateInfo, AttachmentUpdateOutput>(rm.CurrentSource, procedure, ii);
			retList.Add(new AttachmentUpdateIdToken()
			{
				Id = aout.Id,
				Mime = file.ContentType,
				Name = file.FileName,
				Token = _tokenProvider.GenerateToken(aout.Token)
			});
		}
		return retList;
	}

	public async Task<IList<AttachmentUpdateIdToken>> SaveAttachmentsMimeCompress(Int32 tenantId, String pathInfo, HttpFileCollectionBase files, Int64 userId, Int64 companyId, Int32 factor)
	{
		if (factor < 0 || factor > 100)
			throw new ArgumentOutOfRangeException(nameof(factor), $"Invalid factor value: {factor}. Expected [0..100]");
		var rm = await RequestModel.CreateFromBaseUrl(_host, pathInfo);
		ExpandoObject prms = new ExpandoObject();
		String key = rm.ModelAction.ToPascalCase();
		String procedure = $"[{rm.schema}].[{rm.model}.{key}.Update]";
		AttachmentUpdateInfo ii = new AttachmentUpdateInfo
		{
			UserId = userId,
			Id = rm._id,
			Key = key
		};
		if (_host.IsMultiTenant)
			ii.TenantId = tenantId;
		if (_host.IsMultiCompany)
			ii.CompanyId = companyId;
		var retList = new List<AttachmentUpdateIdToken>();
		for (Int32 i = 0; i < files.Count; i++)
		{
			HttpPostedFileBase file = files[i];
			ii.Mime = file.ContentType;
			ii.Name = Path.GetFileName(file.FileName);
			ii.Stream = CompressImage(file.InputStream, file.ContentType, factor);
			var aout = await _dbContext.ExecuteAndLoadAsync<AttachmentUpdateInfo, AttachmentUpdateOutput>(rm.CurrentSource, procedure, ii);
			retList.Add(new AttachmentUpdateIdToken()
			{
				Id = aout.Id,
				Mime = file.ContentType,
				Name = file.FileName,
				Token = _tokenProvider.GenerateToken(aout.Token)
			});
		}
		return retList;
	}

	public async Task<IList<AttachmentUpdateIdToken>> SaveAttachmentsMimeCompressAzure(Int32 tenantId, String pathInfo, HttpFileCollectionBase files, Int64 userId, Int64 companyId, Int32 factor, String container)
	{
		if (factor < 0 || factor > 100)
			throw new ArgumentOutOfRangeException(nameof(factor), $"Invalid factor value: {factor}. Expected [0..100]");
		var rm = await RequestModel.CreateFromBaseUrl(_host, pathInfo);
		ExpandoObject prms = new ExpandoObject();
		String key = rm.ModelAction.ToPascalCase();
		String procedure = $"[{rm.schema}].[{rm.model}.{key}.Update]";
		AttachmentUpdateInfo ii = new AttachmentUpdateInfo
		{
			UserId = userId,
			Id = rm._id,
			Key = key
		};
		if (_host.IsMultiTenant)
			ii.TenantId = tenantId;
		if (_host.IsMultiCompany)
			ii.CompanyId = companyId;
		var azureClient = new AzureStorageRestClient();
		var retList = new List<AttachmentUpdateIdToken>();
		for (Int32 i = 0; i < files.Count; i++)
		{
			HttpPostedFileBase file = files[i];
			var blobName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";

			ii.Mime = file.ContentType;
			ii.Name = Path.GetFileName(file.FileName);
			ii.BlobName = $"{container}/{blobName}";
			ii.Stream = null;

			var stream = CompressImage(file.InputStream, file.ContentType, factor);
			await azureClient.Put(null, container, blobName, stream, (Int32) stream.Length);

			var aout = await _dbContext.ExecuteAndLoadAsync<AttachmentUpdateInfo, AttachmentUpdateOutput>(rm.CurrentSource, procedure, ii);
			retList.Add(new AttachmentUpdateIdToken()
			{
				Id = aout.Id,
				Mime = file.ContentType,
				Name = file.FileName,
				Token = _tokenProvider.GenerateToken(aout.Token)
			});
		}
		return retList;
	}

	static Boolean IsImageForCompress(ImageSettings settings, HttpPostedFileBase file)
	{
		if (settings == null)
			return false;
		if (file.ContentType != MediaTypeNames.Image.Jpeg)
			return false;
		var fileLen = file.ContentLength / 1024 / 1024;
		if (fileLen < settings.threshold)
			return false;
		return true;
	}
	Stream CompressImage(ImageSettings settings, HttpPostedFileBase file)
	{
		if (settings == null)
			return file.InputStream;
		if (IsImageForCompress(settings, file))
			return CompressImage(file.InputStream, file.ContentType, settings.quality);
		return file.InputStream;
	}

	Stream CompressImage(Stream stream, String contentType, Int32 factor)
	{
		if (contentType != MediaTypeNames.Image.Jpeg)
			return stream;
		if (factor == 100)
			return stream;
		var jpegEncoder = GetJpegEncoder();
		using (Bitmap bmp = new Bitmap(stream))
		{
			var ms = new MemoryStream();
			var qualEncoder = Encoder.Quality;
			var encParams = new EncoderParameters(1);
			var encParam = new EncoderParameter(qualEncoder, (long) factor);
			encParams.Param[0] = encParam;
			bmp.Save(ms, jpegEncoder, encParams);
			ms.Seek(0, SeekOrigin.Begin);
			return ms;
		}
	}

	ImageCodecInfo GetJpegEncoder()
	{
		foreach (var enc in ImageCodecInfo.GetImageEncoders())
			if (enc.FormatID == ImageFormat.Jpeg.Guid)
				return enc;
		throw new InvalidOperationException("JPEG encoder not found");
	}

}

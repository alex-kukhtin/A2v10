// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.IO;
using System.Threading.Tasks;
using System.Web;
using System.Collections.Generic;

using A2v10.Infrastructure;

namespace A2v10.Request
{
	public class AttachmentInfo
	{
		public String Mime { get; set; }
		public String Name { get; set; }
		public Byte[] Stream { get; set; }
	}

	public class AttachmentUpdateInfo
	{
		public Int32 TenantId { get; set; }
		public Int64 UserId { get; set; }
		public String Key { get; set; }
		public Object Id { get; set; }
		public String Mime { get; set; }
		public String Name { get; set; }
		public Stream Stream { get; set; }
	}

	public class AttachmentUpdateResult
	{
		public Object Id { get; set; }
		public String Mime { get; set; }
		public String Name { get; set; }
		public Int64 Size { get; set; }
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
			var rm = await RequestModel.CreateFromBaseUrl(_host, Admin, pathInfo);
			// [{source}].[{schema}].[{base}.{key}.Load]
			ExpandoObject prms = new ExpandoObject();
			setParams?.Invoke(prms);
			String key = rm.ModelAction.ToPascalCase();
			prms.Set("Id", rm._id);
			prms.Set("Key", key);
			String procedure = $"[{rm.schema}].[{rm.model}.{key}.{suffix}]";
			return await _dbContext.LoadAsync<AttachmentInfo>(rm.CurrentSource, procedure, prms);
		}

		public async Task<SignatureInfo> DownloadSignature(String pathInfo, Action<ExpandoObject> setParams)
		{
			var rm = await RequestModel.CreateFromBaseUrl(_host, Admin, pathInfo);
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
			var rm = await RequestModel.CreateFromBaseUrl(_host, Admin, pathInfo);
			// [{source}].[{schema}].[{base}.{key}.SaveSignature]
			String key = rm.ModelAction.ToPascalCase();
			prms.Set("Id", rm._id);
			prms.Set("Key", key);
			String procedure = $"[{rm.schema}].[{rm.model}.{key}.SaveSignature]";
			return await _dbContext.LoadAsync<ReturnSignatureInfo>(rm.CurrentSource, procedure, prms);
		}

		public async Task<IList<Object>> SaveAttachments(Int32 tenantId, String pathInfo, HttpFileCollectionBase files, Int64 userId)
		{
			var rm = await RequestModel.CreateFromBaseUrl(_host, Admin, pathInfo);
			ExpandoObject prms = new ExpandoObject();
			String key = rm.ModelAction.ToPascalCase();
			String procedure = $"[{rm.schema}].[{rm.model}.{key}.Update]";
			AttachmentUpdateInfo ii = new AttachmentUpdateInfo
			{
				// TODO: is not tenantId ???
				TenantId = tenantId,
				UserId = userId,
				Id = rm._id,
				Key = key
			};
			var retList = new List<Object>();
			for (Int32 i = 0; i < files.Count; i++)
			{
				HttpPostedFileBase file = files[i];
				ii.Mime = file.ContentType;
				ii.Name = Path.GetFileName(file.FileName);
				ii.Stream = file.InputStream;
				await _dbContext.ExecuteAsync(rm.CurrentSource, procedure, ii);
				retList.Add(ii.Id);
			}
			return retList;
		}
	}
}

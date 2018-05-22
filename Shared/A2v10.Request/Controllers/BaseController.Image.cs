// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.IO;
using System.Threading.Tasks;
using System.Web;

using A2v10.Infrastructure;
using System.Collections.Generic;

namespace A2v10.Request
{
	public class ImageInfo
	{
		public String Mime { get; set; }
		public Byte[] Stream { get; set; }
	}

	public class ImageUpdateInfo
	{
		public Int32 TenantId { get; set; }
		public Int64 UserId { get; set; }
		public String Key { get; set; }
		public Object Id { get; set; }
		public String Mime { get; set; }
		public String Name { get; set; }
		public Stream Stream { get; set; }
	}

	public partial class BaseController
	{
		public async Task<ImageInfo> Image(Int32 tenantId, String pathInfo, Int64 userId)
		{
			var rm = await RequestModel.CreateFromBaseUrl(_host, Admin, pathInfo);
			ExpandoObject prms = new ExpandoObject();
			// [{source}].[{schema}].[{base}.{key}.Load]
			String key = rm.ModelAction.ToPascalCase();
			if (_host.IsMultiTenant)
				prms.Set("TenantId", tenantId);
			prms.Set("UserId", userId);
			prms.Set("Id", rm._id);
			prms.Set("Key", key);
			String procedure = $"[{rm.schema}].[{rm.model}.{key}.Load]";
			return await _dbContext.LoadAsync<ImageInfo>(rm.source, procedure, prms);
		}


		public async Task<IList<Object>> SaveImages(Int32 tenantId, String pathInfo, HttpFileCollectionBase files, Int64 userId)
		{
			var rm = await RequestModel.CreateFromBaseUrl(_host, Admin, pathInfo);
			ExpandoObject prms = new ExpandoObject();
			String key = rm.ModelAction.ToPascalCase();
			String procedure = $"[{rm.schema}].[{rm.model}.{key}.Update]";
			ImageUpdateInfo ii = new ImageUpdateInfo
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
				await _dbContext.ExecuteAsync(rm.source, procedure, ii);
				retList.Add(ii.Id);
			}
			return retList;
		}

		public ImageInfo StaticImage(String url)
		{
			var ii = new ImageInfo();
			var filePath = Path.GetFullPath(Path.Combine(_host.AppPath, _host.AppKey, url.RemoveHeadSlash()));
			ii.Stream = File.ReadAllBytes(filePath);
			ii.Mime = MimeMapping.GetMimeMapping(filePath);
			return ii;
		}
	}
}

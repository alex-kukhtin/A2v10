// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.Threading.Tasks;
using System.Web;

using System.Net.Http.Headers;
using A2v10.Data.Interfaces;

using A2v10.Infrastructure;
using A2v10.Interop;
using System.IO;

namespace A2v10.Request
{
	public partial class BaseController
	{
		public async Task Export(String path, Int32 TenantId, Int64 UserId, ExpandoObject prms, HttpResponseBase response)
		{
			var rm = await RequestModel.CreateFromBaseUrl(_host, Admin, path);
			var action = rm.CurrentAction;
			var export = action.Export;
			if (export == null)
				throw new RequestModelException($"There is no export in '{rm.ModelAction}' action");
			if (prms != null)
			{
				prms.Append(action.parameters);
				prms.SetIfNotExists("Id", action.Id);
			}
			IDataModel dm = await _dbContext.LoadModelAsync(action.CurrentSource, action.ExportProcedure, prms);
			
			var fileName = export.template.AddExtension(export.format.ToString());
			var appReader = _host.ApplicationReader;
			var filePath = appReader.MakeFullPath(action.Path, fileName.RemoveHeadSlash());
			if (!appReader.FileExists(filePath))
				throw new FileNotFoundException(filePath);

			switch (export.format) {
				case RequestExportFormat.xlsx:
					using (var rep = new ExcelReportGenerator(appReader.FileStreamFullPathRO(filePath)))
					{
						rep.GenerateReport(dm);
						Byte[] bytes = File.ReadAllBytes(rep.ResultFile);
						if (bytes == null || bytes.Length == 0)
							throw new RequestModelException("There are no bytes to send");
						SetResponseInfo(response, export);
						response.BinaryWrite(bytes);
					}
					break;
			}
		}

		void SetResponseInfo(HttpResponseBase response, RequestExport export)
		{
			response.ContentType = MimeMapping.GetMimeMapping(export.format.ToString());
			var cdh = new ContentDispositionHeaderValue("attachment")
			{
				FileNameStar = _localizer.Localize(null, export.fileName) + '.' + export.format.ToString()
			};
			response.Headers.Add("Content-Disposition", cdh.ToString());
		}
	}
}

// Copyright © 2015-2022 Alex Kukhtin. All rights reserved.

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
			var rm = await RequestModel.CreateFromBaseUrl(_host, path);
			var action = rm.CurrentAction;
			var export = action.Export;
			if (export == null)
				throw new RequestModelException($"There is no export in '{rm.ModelAction}' action");
			if (prms != null)
			{
				prms.Append(action.parameters);
				prms.SetIfNotExists("Id", action.Id);
			}
			IDataModel dm = await _dbContext.LoadModelAsync(action.CurrentSource, action.ExportProcedure, prms, action.commandTimeout);

			_host.CheckTypes(action.Path, action.checkTypes, dm);

			Stream stream = null;
			var templExpr = export.GetTemplateExpression();
			if (!String.IsNullOrEmpty(templExpr))
			{
				var bytes = dm.Eval<Byte[]>(templExpr);
				if (bytes == null)
					throw new RequestModelException($"Template stream not found or its format is invalid. ({templExpr})");
				stream = new MemoryStream(dm.Eval<Byte[]>(templExpr));
			}
			else if (!String.IsNullOrEmpty(export.template))
			{
				var fileName = export.template.AddExtension(export.format.ToString());
				var appReader = _host.ApplicationReader;
				var filePath = appReader.MakeFullPath(action.Path, fileName.RemoveHeadSlash());
				if (!appReader.FileExists(filePath))
					throw new FileNotFoundException($"Template file not found. ({fileName})");
				stream = appReader.FileStreamFullPathRO(filePath);
			}

			switch (export.format) {
				case RequestExportFormat.xlsx:
					using (var rep = new ExcelReportGenerator(stream))
					{
						rep.GenerateReport(dm);
						Byte[] bytes = File.ReadAllBytes(rep.ResultFile);
						if (bytes == null || bytes.Length == 0)
							throw new RequestModelException("There are no bytes to send");
						SetResponseInfo(response, export, dm);
						response.BinaryWrite(bytes);
						stream.Close();
					}
					break;
				case RequestExportFormat.dbf:
				case RequestExportFormat.csv:
					{
						var fmt = export.format.ToString().ToLowerInvariant();
						var extDataProvider = _externalDataProvider.GetWriter(dm, fmt, export.GetEncoding());
						if (extDataProvider == null)
							throw new RequestModelException($"There is no data provider for '{fmt}' files");
						extDataProvider.Write(response.OutputStream);
						SetResponseInfo(response, export, dm);
					}
					break;
			}
		}

		void SetResponseInfo(HttpResponseBase response, RequestExport export, IDataModel model)
		{
			response.ContentType = MimeMapping.GetMimeMapping(export.format.ToString());
			var fn = model.ResolveDataModel(export.fileName);
			var cdh = new ContentDispositionHeaderValue("attachment")
			{
				FileNameStar = _localizer.Localize(null, fn) + '.' + export.format.ToString()
			};
			response.Headers.Add("Content-Disposition", cdh.ToString());
		}
	}
}

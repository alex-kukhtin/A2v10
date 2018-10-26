using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using A2v10.Request;
using Stimulsoft.Report;

namespace A2v10.Reports.Actions
{
	public class AttachStiReport : IInvokeTarget
	{
		IApplicationHost _host;
		IDbContext _dbContext;
		public void Inject(IApplicationHost host, IDbContext dbContext)
		{
			_host = host;
			_dbContext = dbContext;
		}

		public async Task<Object> InvokeAsync(Int64 UserId, Int32 TenantId, Int64 Id, String Report, String Model, String Schema)
		{
			var dm = await _dbContext.LoadModelAsync(String.Empty, $"[{Schema}].[{Model}.Report]", new { UserId, TenantId, Id });
			String path = _host.MakeFullPath(false, Report, String.Empty);
			path = Path.ChangeExtension(path, ".mrt");
			var r = StiReportExtensions.CreateReport(path, String.Empty);
			r.AddDataModel(dm);
			using (var ms = new MemoryStream())
			{
				r.Render();
				r.ExportDocument(StiExportFormat.Pdf, ms, StiReportExtensions.GetDefaultPdfSettings());
				ms.Seek(0, SeekOrigin.Begin);
				AttachmentUpdateInfo ai = new AttachmentUpdateInfo()
				{
					UserId = UserId,
					TenantId = TenantId,
					Id = Id,
					Mime = "application/pdf",
					Stream = ms,
					Name = r.ReportName
				};
				if (String.IsNullOrEmpty(ai.Name))
					ai.Name = "Attachment";
				await _dbContext.ExecuteAsync(String.Empty, $"[{Schema}].[{Model}.SaveAttachment]", ai);
				return new { ai.Id };
			}
		}
	}
}

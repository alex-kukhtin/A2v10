// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

using System;
using System.IO;
using System.Threading.Tasks;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using A2v10.Request;

namespace A2v10.Reports.Actions
{
	public class AttachStiReport : AttachReportBase, IInvokeTarget
	{
		private IDbContext _dbContext;
		private ReportHelper _reportHelper;
		private ITokenProvider _tokenProvider;

		protected override String FileExtension => ".mrt";

		public void Inject(IApplicationHost host, IDbContext dbContext, ITokenProvider tokenProvider)
		{
			_host = host;
			_dbContext = dbContext;
			_tokenProvider = tokenProvider;
			_reportHelper = new ReportHelper();
		}

		public async Task<Object> InvokeAsync(Int64 UserId, Int32 TenantId, Int64 Id, String Report, String Model, String Schema)
		{
			_reportHelper.SetupLicense();
			var dm = await _dbContext.LoadModelAsync(String.Empty, $"[{Schema}].[{Model}.Report]", new { UserId, TenantId, Id });

			using (var stream = CreateStream(dm, Report))
			{
				using (var ms = new MemoryStream())
				{
					String repName = await _reportHelper.ExportDocumentAsync(stream, dm, ms);
					ms.Seek(0, SeekOrigin.Begin);
					AttachmentUpdateInfo ai = new AttachmentUpdateInfo()
					{
						UserId = UserId,
						TenantId = TenantId,
						Id = Id,
						Mime = "application/pdf",
						Stream = ms,
						Name = repName
					};
					if (String.IsNullOrEmpty(ai.Name))
						ai.Name = "Attachment";
					var aout = await _dbContext.ExecuteAndLoadAsync<AttachmentUpdateInfo, AttachmentUpdateOutput>
						(String.Empty, $"[{Schema}].[{Model}.SaveAttachment]", ai);
					if (aout == null)
						throw new InvalidOperationException($"'[{Schema}].[{Model}.SaveAttachment]' procedure did not return result");
					return new { aout.Id, Token =_tokenProvider.GenerateToken(aout.Token) };
				}
			}
		}
	}
}

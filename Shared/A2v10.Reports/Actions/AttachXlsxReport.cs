// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

using System;
using System.IO;
using System.Threading.Tasks;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using A2v10.Interop;
using A2v10.Request;

namespace A2v10.Reports.Actions
{
	public class AttachXlsxReport : AttachReportBase, IInvokeTarget
	{
		private IDbContext _dbContext;
		private ITokenProvider _tokenProvider;

		public void Inject(IApplicationHost host, IDbContext dbContext, ITokenProvider tokenProvider)
		{
			_host = host;
			_dbContext = dbContext;
			_tokenProvider = tokenProvider;
		}

		protected override String FileExtension => ".xlsx";

		public async Task<Object> InvokeAsync(Int64 UserId, Int32 TenantId, Int64 Id, String Report, String Model, String Schema)
		{
			var dm = await _dbContext.LoadModelAsync(String.Empty, $"[{Schema}].[{Model}.Report]", new { UserId, TenantId, Id });

			using (Stream stream = CreateStream(dm, Report))
			{
				using (var rep = new ExcelReportGenerator(stream))
				{
					rep.GenerateReport(dm);
					Byte[] bytes = File.ReadAllBytes(rep.ResultFile);
					if (bytes == null || bytes.Length == 0)
						throw new InvalidProgramException("There are no bytes to save");
					using (var ms = new MemoryStream(bytes))
					{
						AttachmentUpdateInfo ai = new AttachmentUpdateInfo()
						{
							UserId = UserId,
							TenantId = TenantId,
							Id = Id,
							Mime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
							Stream = ms,
							Name = Path.GetFileNameWithoutExtension(Report)
						};
						if (String.IsNullOrEmpty(ai.Name))
							ai.Name = "Attachment";
						var aout = await _dbContext.ExecuteAndLoadAsync<AttachmentUpdateInfo, AttachmentUpdateOutput>
							(String.Empty, $"[{Schema}].[{Model}.SaveAttachment]", ai);
						return new { Id = aout.Id, Token = _tokenProvider.GenerateToken(aout.Token) };
					}
				}
			}
		}
	}
}

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
	public class AttachXlsxReport : IInvokeTarget
	{
		private IApplicationHost _host;
		private IDbContext _dbContext;
		public void Inject(IApplicationHost host, IDbContext dbContext)
		{
			_host = host;
			_dbContext = dbContext;
		}

		public async Task<Object> InvokeAsync(Int64 UserId, Int32 TenantId, Int64 Id, String Report, String Model, String Schema)
		{
			var dm = await _dbContext.LoadModelAsync(String.Empty, $"[{Schema}].[{Model}.Report]", new { UserId, TenantId, Id });
			String path = _host.ApplicationReader.MakeFullPath(Report, String.Empty).ToLowerInvariant();

			if (!path.EndsWith(".xlsx"))
				path += ".xlsx";

			if (!_host.ApplicationReader.FileExists(path))
				throw new FileNotFoundException($"File not found: '{path}'");

			Stream stream = _host.ApplicationReader.FileStreamFullPathRO(path);

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
						Name = Path.GetFileNameWithoutExtension(path)
					};
					if (String.IsNullOrEmpty(ai.Name))
						ai.Name = "Attachment";
					await _dbContext.ExecuteAsync(String.Empty, $"[{Schema}].[{Model}.SaveAttachment]", ai);
					stream.Close();
					return new { ai.Id };
				}
			}
		}
	}
}

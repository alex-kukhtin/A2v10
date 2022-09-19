// Copyright © 2015-2022 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.IO;
using System.Threading.Tasks;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using A2v10.Request;

namespace A2v10.Reports.Actions;

public class AttachPdfReport : AttachReportBase, IInvokeTarget
{
	private IDbContext _dbContext;
	private ITokenProvider _tokenProvider;
	private PdfReportHelper _reportHelper;

	public void Inject(IApplicationHost host, IDbContext dbContext, ITokenProvider tokenProvider)
	{
		_host = host;
		_dbContext = dbContext;
		_tokenProvider = tokenProvider;
		_reportHelper = new PdfReportHelper(_host);
	}

	protected override String FileExtension => ".xaml";

	public async Task<Object> InvokeAsync(Int64 UserId, Int32 TenantId, Int64 Id, String Base, String Report)
	{

		var url = $"/_report/{Base.RemoveHeadSlash()}/{Report}/{Id}";
		var repInfo = await RequestModel.CreateFromBaseUrl(_host, url);
		var rqRep = repInfo.GetReport();
		if (rqRep == null)
			throw new FileNotFoundException($"Report not found:{Report}");

		var prms = rqRep.parameters.Clone();
		prms.Add("UserId", UserId);
		prms.Add("Id", Id);

		if (TenantId != 0)
			prms.Add("TenantId", TenantId);
		var dm = await _dbContext.LoadModelAsync(String.Empty, rqRep.ReportProcedure, prms);

		var repPath = System.IO.Path.Combine(rqRep.Path, rqRep.ReportName);
		using var stream = CreateStream(dm, repPath);
		using var repStream = _reportHelper.Build(repPath, stream, dm.Root);
		AttachmentUpdateInfo ai = new AttachmentUpdateInfo()
		{
			UserId = UserId,
			TenantId = TenantId == 0 ? null : TenantId,
			Id = Id,
			Mime = MimeTypes.Application.Pdf,
			Stream = repStream,
			Name = dm.Root.Resolve(rqRep.name)
		};
		if (String.IsNullOrEmpty(ai.Name))
			ai.Name = "Attachment";
		var saveProc = rqRep.ReportProcedure.Replace(".Report", ".SaveAttachment");
		var aout = await _dbContext.ExecuteAndLoadAsync<AttachmentUpdateInfo, AttachmentUpdateOutput>
			(String.Empty, saveProc, ai);
		if (aout == null)
			throw new InvalidOperationException($"'{saveProc}' procedure did not return result");
		return new { aout.Id, Token = _tokenProvider.GenerateToken(aout.Token) };
	}
}

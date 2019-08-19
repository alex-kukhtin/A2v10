// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.


using System;
using System.Threading.Tasks;
using System.Dynamic;
using System.IO;
using System.Text;
using System.Configuration;
using System.Threading;
using System.Web.Mvc;

using Microsoft.AspNet.Identity;

using Newtonsoft.Json;

using Stimulsoft.Report.Mvc;
using Stimulsoft.Report.Web;

using A2v10.Infrastructure;
using A2v10.Request;
using A2v10.Reports;
using A2v10.Web.Mvc.Filters;
using A2v10.Web.Identity;
using A2v10.Interop;

namespace A2v10.Web.Mvc.Controllers
{

	public class EmptyView : IView, IViewDataContainer
	{
		public ViewDataDictionary ViewData { get; set; }
		public void Render(ViewContext viewContext, TextWriter writer)
		{
			// do nothing
		}
	}

	[Authorize]
	[ExecutingFilter]
	[CheckMobileFilter]
	public class ReportController : Controller
	{
		A2v10.Request.BaseController _baseController = new BaseController();
		ReportHelper _reportHelper = new ReportHelper();

		public ReportController()
		{
			_baseController.Host.StartApplication(false);
		}

		public Int64 UserId => User.Identity.GetUserId<Int64>();
		public Int32 TenantId => User.Identity.GetUserTenantId();
		public Int64 CompanyId => _baseController.UserStateManager.UserCompanyId(TenantId, UserId);

		[HttpGet]
		public async Task Show(String Base, String Rep, String id)
		{
			_reportHelper.SetupLicense();
			try
			{
				var url = $"/_report/{Base.RemoveHeadSlash()}/{Rep}/{id}";
				RequestModel rm = await RequestModel.CreateFromBaseUrl(_baseController.Host, false, url);
				var rep = rm.GetReport();

				var view = new EmptyView();
				var vc = new ViewContext(ControllerContext, view, ViewData, TempData, Response.Output);
				var hh = new HtmlHelper(vc, view);
				var result = hh.Stimulsoft().StiMvcViewer("A2v10StiMvcViewer", ViewerOptions);

				var sb = new StringBuilder(ResourceHelper.StiReportHtml);
				sb.Replace("$(StiReport)", result.ToHtmlString());
				sb.Replace("$(Lang)", _baseController.CurrentLang);
				sb.Replace("$(Title)", _baseController.Localize(rep.name ?? Rep)); 

				Response.Output.Write(sb.ToString());
			}
			catch (Exception ex)
			{
				if (ex.InnerException != null)
					ex = ex.InnerException;
				Response.Write(ex.Message);
			}
		}

		async Task<ReportInfo> GetReportInfo(String url, String id, ExpandoObject prms)
		{
			var rc = new ReportContext()
			{
				UserId = UserId,
				TenantId = TenantId,
				CompanyId = CompanyId
			};
			return await _reportHelper.GetReportInfo(rc, url, id, prms);
		}

		ExpandoObject CreateParamsFromQueryString()
		{
			var eo = new ExpandoObject();
			if (Request.QueryString.Count == 0)
				return eo;
			eo.Append(_baseController.CheckPeriod(Request.QueryString), toPascalCase: true);
			eo.RemoveKeys("rep,Rep,base,Base,Format,format");
			return eo;
		}

		[HttpGet]
		[OutputCache(Duration = 0)]
		public async Task<ActionResult> Export(String Base, String Rep, String id, String Format)
		{
			_reportHelper.SetupLicense();
			try
			{
				var url = $"/_report/{Base.RemoveHeadSlash()}/{Rep}/{id}";
				ReportInfo ri = await GetReportInfo(url, id, CreateParamsFromQueryString());

				switch (ri.Type) {
					case RequestReportType.stimulsoft:
						return _reportHelper.ExportStiReport(ri, Format, saveFile:true);
					case RequestReportType.xml:
						return ExportXmlReport(ri);
					case RequestReportType.json:
						return ExportJsonReport(ri);
				}
			}
			catch (Exception ex)
			{
				Response.ContentType = "text/html";
				Response.ContentEncoding = Encoding.UTF8;
				if (ex.InnerException != null)
					ex = ex.InnerException;
				Response.Write(ex.Message);
			}
			return new EmptyResult();
		}


		[HttpGet]
		[OutputCache(Duration = 0)]
		public async Task<ActionResult> Print(String Base, String Rep, String id, String Format)
		{
			_reportHelper.SetupLicense();
			try
			{
				var url = $"/_report/{Base.RemoveHeadSlash()}/{Rep}/{id}";
				ReportInfo ri = await GetReportInfo(url, id, CreateParamsFromQueryString());

				switch (ri.Type)
				{
					case RequestReportType.stimulsoft:
						return _reportHelper.ExportStiReport(ri, Format, saveFile: false);
					default:
						throw new NotImplementedException();
				}
			}
			catch (Exception ex)
			{
				Response.ContentType = "text/html";
				Response.ContentEncoding = Encoding.UTF8;
				if (ex.InnerException != null)
					ex = ex.InnerException;
				Response.Write(ex.Message);
			}
			return new EmptyResult();
		}

		ActionResult ExportJsonReport(ReportInfo ri)
		{
			String json = JsonConvert.SerializeObject(ri.DataModel.Root, Formatting.Indented);
			return Content(json, "application/json", Encoding.UTF8);
		}

		ActionResult ExportXmlReport(ReportInfo ri)
		{
			if (ri.XmlSchemaPathes == null)
				throw new RequestModelException("The xml-schemes are not specified");
			foreach (var path in ri.XmlSchemaPathes)
			{
				if (!System.IO.File.Exists(path))
					throw new RequestModelException($"File not found '{path}'");
			}
			if (String.IsNullOrEmpty(ri.Encoding))
				throw new RequestModelException("The xml encoding is not specified");
			var xmlCreator = new XmlCreator(ri.XmlSchemaPathes, ri.DataModel, ri.Encoding)
			{
				Validate = ri.Validate
			};
			var bytes = xmlCreator.CreateXml();
			if (xmlCreator.HasErrors)
				throw new Exception(xmlCreator.ErrorMessage);
			return File(bytes, "text/xml", $"{ri.Name}.xml");
		}

		private String LocaleKey => Thread.CurrentThread.CurrentUICulture.TwoLetterISOLanguageName;

		private StiMvcViewerOptions ViewerOptions {
			get {
				String localeFile = $"~/Localization/{LocaleKey}.xml";
				return new StiMvcViewerOptions()
				{
					Theme = StiViewerTheme.Office2013LightGrayBlue,
					Localization = localeFile,
					Server = new StiMvcViewerOptions.ServerOptions()
					{
						Controller = "StiReport",
						RequestTimeout = 300,
						UseRelativeUrls = true
					},
					Actions = new StiMvcViewerOptions.ActionOptions()
					{
						GetReport = "GetReport",
						ViewerEvent = "ViewerEvent",
						PrintReport = "PrintReport",
						ExportReport = "ExportReport",
						Interaction = "Interaction",
					},
					Appearance = new StiMvcViewerOptions.AppearanceOptions()
					{
						BackgroundColor = System.Drawing.Color.FromArgb(0x00e3e3e3),
						ShowTooltips = false,
						ScrollbarsMode = true,
						FullScreenMode = true,
					},
					Toolbar = new StiMvcViewerOptions.ToolbarOptions()
					{
						MenuAnimation = false,
						ShowFullScreenButton = false,
						ShowMenuMode = StiShowMenuMode.Click,
						//FontFamily = "system-ui, 'Segoe UI', Tahoma, Verdana, sans-serif",
						//FontColor = System.Drawing.Color.FromArgb(0x00333333),
						ShowBookmarksButton = false,
						ShowParametersButton = true,
						ShowSendEmailButton = false,
					},
					Exports = new StiMvcViewerOptions.ExportOptions()
					{
						DefaultSettings = StiReportExtensions.GetExportSettings()
					}
				};
			}
		}


		public async Task<ActionResult> GetReport()
		{
			try
			{
				var rp = StiMvcViewer.GetRequestParams();
				var Rep = rp.HttpContext.Request.Params["Rep"];
				var Base = rp.HttpContext.Request.Params["Base"];
				var id = rp.Routes["Id"];
				var url = $"/_report/{Base.RemoveHeadSlash()}/{Rep}/{id}";

				//TODO: profile var token = Profiler.BeginReport("create");
				var prms = new ExpandoObject();
				prms.Append(_baseController.CheckPeriod(rp.HttpContext.Request.QueryString), toPascalCase: true);
				prms.RemoveKeys("Rep,rep,Base,base,Format,format");

				ReportInfo ri = await GetReportInfo(url, id, prms);
				//TODO: image settings var rm = rm.ImageInfo;
				if (ri == null)
					throw new InvalidProgramException("invalid data");
				var path = ri.ReportPath;
				using (var stream = _baseController.Host.ApplicationReader.FileStreamFullPathRO(path))
				{
					var r = StiReportExtensions.CreateReport(stream, ri.Name);
					r.AddDataModel(ri.DataModel);
					var vars = ri.Variables;
					if (vars != null)
						r.AddVariables(vars);
					return StiMvcViewer.GetReportResult(r);
				}
			}
			catch (Exception ex)
			{
				String msg = ex.Message;
				Int32 x = msg.IndexOf(": error");
				if (x != -1)
					msg = msg.Substring(x + 7).Trim();
				return new HttpStatusCodeResult(500, msg);
			}
		}

		public ActionResult ViewerEvent()
		{
			return StiMvcViewer.ViewerEventResult();
		}

		public ActionResult PrintReport()
		{
			return StiMvcViewer.PrintReportResult();
		}

		public ActionResult ExportReport()
		{
			return StiMvcViewer.ExportReportResult();
		}

		public ActionResult Interaction()
		{
			return StiMvcViewer.InteractionResult();
		}
	}
}

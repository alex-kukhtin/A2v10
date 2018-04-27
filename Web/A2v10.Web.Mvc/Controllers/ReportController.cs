// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.


using System;
using System.Web.Mvc;
using System.Threading.Tasks;
using System.Dynamic;
using System.IO;
using System.Text;
using System.Configuration;

using Microsoft.AspNet.Identity;

using Stimulsoft.Report.Mvc;
using Stimulsoft.Report.Web;

using A2v10.Infrastructure;
using A2v10.Request;
using A2v10.Reports;
using A2v10.Web.Mvc.Filters;
using A2v10.Web.Mvc.Identity;
using A2v10.Data.Interfaces;


namespace A2v10.Web.Mvc.Controllers
{
	class ReportInfo
	{
		public IDataModel DataModel;
		public String ReportPath;
		public String Name;
		public ExpandoObject Variables;
	}

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
	public class ReportController : Controller
	{
		A2v10.Request.BaseController _baseController = new BaseController();

		public ReportController()
		{
		}

		public Int64 UserId => User.Identity.GetUserId<Int64>();
		public Int32 TenantId => User.Identity.GetUserTenantId();

		[HttpGet]
		public async Task Show(String Base, String Rep, String id)
		{
			SetupLicense();
			try
			{
				var url = $"/_report/{Base}/{Rep}/{id}";
				RequestModel rm = await RequestModel.CreateFromBaseUrl(_baseController.Host, false, url);
				var rep = rm.GetReport();

				var view = new EmptyView();
				var vc = new ViewContext(ControllerContext, view, ViewData, TempData, Response.Output);
				var hh = new HtmlHelper(vc, view);
				var result = hh.Stimulsoft().StiMvcViewer("A2v10StiMvcViewer", ViewerOptions);

				var sb = new StringBuilder(ResourceHelper.StiReportHtml);
				sb.Replace("$(StiReport)", result.ToHtmlString());
				sb.Replace("$(Lang)", _baseController.CurrentLang);
				sb.Replace("$(Title)", _baseController.Localize(rep.name != null ? rep.name : Rep)); 

				Response.Output.Write(sb.ToString());
			}
			catch (Exception ex)
			{
				if (ex.InnerException != null)
					ex = ex.InnerException;
				Response.Write(ex.Message);
			}
		}

		async Task<ReportInfo> GetReportInfo(String url, String id)
		{
			var ri = new ReportInfo();
			RequestModel rm = await RequestModel.CreateFromBaseUrl(_baseController.Host, false, url);
			var rep = rm.GetReport();
			ri.ReportPath = _baseController.Host.MakeFullPath(false, rep.Path, rep.ReportName + ".mrt");

			ExpandoObject prms = new ExpandoObject();
			prms.Set("UserId", UserId);
			if (_baseController.Host.IsMultiTenant)
				prms.Set("TenantId", TenantId);
			prms.Set("Id", id);
			prms.AppendAndReplace(rep.parameters);

			// TODO: make defer for AZURE!
			ri.DataModel = await _baseController.DbContext.LoadModelAsync(rep.CurrentSource, rep.ReportProcedure, prms);

			// after query
			ExpandoObject vars = rep.variables;
			if (vars == null)
				vars = new ExpandoObject();
			vars.Set("UserId", UserId);
			if (_baseController.Host.IsMultiTenant)
				vars.Set("TenantId", TenantId);
			vars.Set("Id", id);
			ri.Variables = vars;
			ri.Name = _baseController.Localize(String.IsNullOrEmpty(rep.name) ? rep.ReportName : rep.name);
			return ri;
		}

		[HttpGet]
		[OutputCache(Duration = 0)]
		public async Task<ActionResult> Export(String Base, String Rep, String id)
		{
			SetupLicense();
			try
			{
				var url = $"/_report/{Base}/{Rep}/{id}";
				ReportInfo ri = await GetReportInfo(url, id);
				var r = StiReportExtensions.CreateReport(ri.ReportPath, ri.Name);
				if (ri.DataModel != null)
				{
					var dynModel = ri.DataModel.GetDynamic();
					foreach (var x in dynModel)
						r.RegBusinessObject(x.Key, x.Value);
				}
				if (ri.Variables != null)
					r.AddVariables(ri.Variables);
				var ms = new MemoryStream();
				// saveFileDialog: true -> download
				// saveFileDialog: false -> show
				return StiMvcReportResponse.ResponseAsPdf(r, StiReportExtensions.GetPdfExportSettings(), saveFileDialog:true);
			}
			catch (Exception ex)
			{
				Response.ContentType = "text/plain";
				Response.ContentEncoding = Encoding.UTF8;
				if (ex.InnerException != null)
					ex = ex.InnerException;
				Response.Write(ex.Message);
			}
			return new EmptyResult();
		}

		private StiMvcViewerOptions ViewerOptions {
			get {
				String localeFile = $"~/Localization/uk.xml"; // TODO
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

		private Boolean _licenseSet = false;

		private void SetupLicense()
		{
			if (_licenseSet)
				return;
			_licenseSet = true;
			var lic = ConfigurationManager.AppSettings["stimulsoft.license"];
			if (!String.IsNullOrEmpty(lic))
				Stimulsoft.Base.StiLicense.LoadFromString(lic);
		}

		public async Task<ActionResult> GetReport()
		{
			try
			{
				var rp = StiMvcViewer.GetRequestParams();
				var Rep = rp.HttpContext.Request.Params["Rep"];
				var Base = rp.HttpContext.Request.Params["Base"];
				var id = rp.Routes["Id"];
				var url = $"/_report/{Base}/{Rep}/{id}";

				//TODO: profile var token = Profiler.BeginReport("create");

				ReportInfo ri = await GetReportInfo(url, id);
				//TODO: image settings var rm = rm.ImageInfo;
				if (ri == null)
					throw new InvalidProgramException("invalid data");
				var path = ri.ReportPath;
				var r = StiReportExtensions.CreateReport(path, ri.Name);
				if (ri.DataModel != null)
				{
					var dynModel = ri.DataModel.GetDynamic();
					foreach (var x in dynModel)
						r.RegBusinessObject(x.Key, x.Value);
				}
				var vars = ri.Variables;
				if (vars != null)
					r.AddVariables(vars);
				return StiMvcViewer.GetReportResult(r);
			}
			catch (Exception ex)
			{
				String msg = ex.Message;
				int x = msg.IndexOf(": error");
				if (x != -1)
					msg = msg.Substring(x + 7).Trim();
				return new ContentResult() { Content = "Error:" + msg };
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

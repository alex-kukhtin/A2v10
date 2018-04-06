// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.


using System;
using System.Web.Mvc;
using System.Threading.Tasks;
using System.Dynamic;
using System.IO;
using System.Web.Hosting;

using Microsoft.AspNet.Identity;

using Stimulsoft.Report.Mvc;

using A2v10.Infrastructure;
using A2v10.Request;
using A2v10.Reports;
using A2v10.Web.Mvc.Filters;
using A2v10.Web.Mvc.Identity;
using A2v10.Data.Interfaces;
using Stimulsoft.Report.Web;
using System.Text;

namespace A2v10.Web.Mvc.Controllers
{
	class ReportInfo
	{
		public IDataModel DataModel;
		public String ReportPath;
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
				ReportInfo ri = await GetReportInfo(url, id);

				TempData["StiDataModel"] = ri.DataModel;
				TempData["StiFilePath"] = ri.ReportPath;
				TempData["StiVariables"] = ri.Variables;

				var view = new EmptyView();
				var vc = new ViewContext(ControllerContext, view, ViewData, TempData, Response.Output);
				var hh = new HtmlHelper(vc, view);
				var result = hh.Stimulsoft().StiMvcViewer("A2v10StiMvcViewer", ViewerOptions);

				var sb = new StringBuilder(ResourceHelper.StiReportHtml);
				sb.Replace("$(StiReport)", result.ToHtmlString());
				sb.Replace("$(Lang)", _baseController.CurrentLang);
				if (ri.DataModel.System != null)
					sb.Replace("$(Title)", ri.DataModel.System.Get<String>("Title"));
				else
					sb.Replace("$(Title)", "A2:Web");

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

			return ri;
		}

		public async Task<ActionResult> Export(String Base, String Rep, String id)
		{
			SetupLicense();
			try
			{
				var url = $"/_report/{Base}/{Rep}/{id}";
				ReportInfo ri = await GetReportInfo(url, id);
			}
			catch (Exception ex)
			{
				if (ex.InnerException != null)
					ex = ex.InnerException;
				return View("Exception", ex);
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
						FontFamily = "Segoe UI,Tahoma,Arial,Verdana,Sans-Serif",
						FontColor = System.Drawing.Color.FromArgb(0x00333333),
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
			var serverPath = HostingEnvironment.MapPath("~");
			String licPath = Path.Combine(serverPath, "licenses", "stimulsoft.license.key");
			if (System.IO.File.Exists(licPath))
			{
				Stimulsoft.Base.StiLicense.LoadFromFile(licPath);
			}
		}

		public ActionResult GetReport()
		{
			try
			{
				var path = TempData["StiFilePath"].ToString();
				//TODO: image settings var rm = TempData["StiImage"] as ImageInfo;
				//TODO: profile var token = Profiler.BeginReport("create");
				var r = StiReportExtensions.CreateReport(path);
				//Profiler.EndReport(token);
				var iDataModel = TempData["StiDataModel"] as IDataModel;
				if (iDataModel != null)
				{
					var dynModel = iDataModel.GetDynamic();
					foreach (var x in dynModel)
						r.RegBusinessObject(x.Key, x.Value);
				}
				var vars = TempData["StiVariables"] as ExpandoObject;
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

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

namespace A2v10.Web.Mvc.Controllers
{
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

		public async Task<ActionResult> Show(String Base, String Rep, String id)
		{
			SetupLicense();
			try
			{
				var url = $"/_report/{Base}/{Rep}/{id}";
				RequestModel rm = await RequestModel.CreateFromBaseUrl(_baseController.Host, false, url);
				var rep = rm.GetReport();
				String reportPath = _baseController.Host.MakeFullPath(false, rep.Path, rep.ReportName + ".mrt");
				ExpandoObject prms = new ExpandoObject();
				prms.Set("UserId", UserId);
				if (_baseController.Host.IsMultiTenant)
					prms.Set("TenantId", TenantId);
				prms.Set("Id", id);
				var iDataModel = await _baseController.DbContext.LoadModelAsync(rep.CurrentSource, rep.ReportProcedure, prms);
				TempData["StiDataModel"] = iDataModel;
				TempData["StiFilePath"] = reportPath;
				// after query
				ExpandoObject vars = rep.variables;
				if (vars == null)
					vars = new ExpandoObject();
				vars.Set("UserId", UserId);
				if (_baseController.Host.IsMultiTenant)
					vars.Set("TenantId", TenantId);
				vars.Set("Id", id);
				TempData["StiVariables"] = vars;
				ViewBag.locale = "uk"; // TODO
				ViewBag.Title = null;
				if (iDataModel.System != null)
					ViewBag.Title = iDataModel.System.Get<String>("Title");
				return View("StiReport");
			}
			catch (Exception ex)
			{
				if (ex.InnerException != null)
					ex = ex.InnerException;
				return View("Exception", ex);
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

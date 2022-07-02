// Copyright © 2015-2022 Alex Kukhtin. All rights reserved.

using System;
using System.Threading.Tasks;
using System.Configuration;
using System.IO;
using System.Web.Mvc;
using System.Reflection;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;

namespace A2v10.Reports
{
	public static class StimulsoftVersion
	{
		public const Int32 ExpectedVersion = 1003;
	}

	public sealed class ReportHelper
	{
		private readonly IApplicationHost _host;
		private readonly IStimulsoftReportShim _stimulsoftReportShim;

        public ReportHelper(IApplicationHost host)
		{
            // DI ready
            _host = host;
            IServiceLocator locator = host.Locator;
			_stimulsoftReportShim = locator.GetService<IStimulsoftReportShim>(sloc =>
			{
				var inst = System.Activator.CreateInstance("A2v10.Stimulsoft", "A2v10.Stimulsoft.StimulsoftReportShim");
                if (inst == null)
                    throw new ArgumentNullException("A2v10.Stimulsoft");
				var instUnwrap = inst.Unwrap();
				var ass = Assembly.GetAssembly(instUnwrap.GetType());

				var actualBuild = ass.GetName().Version.Build;

				if (actualBuild < StimulsoftVersion.ExpectedVersion)
					throw new InvalidProgramException($"Invalid A2v10.Stimulsoft build. Expected: {StimulsoftVersion.ExpectedVersion}, Actual: {actualBuild}");
				var shim = instUnwrap as IStimulsoftReportShim;
				shim.Inject(sloc);
				return shim;
			});
		}


		// saveFileDialog: true -> download
		// saveFileDialog: false -> show
		public ActionResult ExportStiReport(ReportInfo ri, String format, Boolean saveFile = true)
		{
			var targetFormat = (format ?? "pdf").ToLowerInvariant();
			using (var stream = ri.GetStream(_host.ApplicationReader))
			{
				return _stimulsoftReportShim.ExportStiReport(stream, ri, targetFormat, saveFile);
			}
		}

		public Task<ExportReportResult> ExportStiReportStreamAsync(ReportInfo ri, String format, Stream output)
		{
			var targetFormat = (format ?? "pdf").ToLowerInvariant();
			using (var stream = ri.GetStream(_host.ApplicationReader))
			{
				return _stimulsoftReportShim.ExportStiReportStreamAsync(stream, ri, targetFormat, output);
			}
		}

		private Boolean _licenseSet = false;

		public void SetupLicense()
		{
			if (_licenseSet)
				return;
			_licenseSet = true;
			var lic = ConfigurationManager.AppSettings["stimulsoft.license"];
			if (!String.IsNullOrEmpty(lic))
				_stimulsoftReportShim.SetupLicense(lic);
		}

		public ActionResult ViewerEvent()
		{
			return _stimulsoftReportShim.ViewerEvent() as ActionResult;
		}

		public ActionResult Interaction()
		{
			return _stimulsoftReportShim.Interaction() as ActionResult;
		}

		public ActionResult PrintReport()
		{
			return _stimulsoftReportShim.PrintReport() as ActionResult;
		}

		public ActionResult ExportReport()
		{
			return _stimulsoftReportShim.ExportReport() as ActionResult;
		}

		public MvcHtmlString ShowViewer(Controller controller)
		{
			return _stimulsoftReportShim.ShowViewer(controller);
		}

		public IStimulsoftRequestParams GetViewerRequestParams()
		{
			return _stimulsoftReportShim.GetViewerRequestParams();
		}

		public ActionResult CreateReportResult(Stream input, ReportInfo ri)
		{
			return _stimulsoftReportShim.CreateReportResult(input, ri);
		}

		public Task<String> ExportDocumentAsync(Stream input, IDataModel dataModel, Stream output)
		{
			return _stimulsoftReportShim.ExportDocumentAsync(input, dataModel, output);
		}
	}
}

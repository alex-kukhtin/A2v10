// Copyright © 2021 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Specialized;
using System.Dynamic;
using System.IO;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using A2v10.Data.Interfaces;
using A2v10.Infrastructure;

namespace A2v10.Reports
{

	public class ExportReportResult
	{
		public String ContentType;
		public String Extension;
	}

	public interface IStumulsoftReportInfo
	{
		IDataModel DataModel { get; }
		String Name { get; }
		ExpandoObject Variables { get; }
	}

	public interface IStimulsoftRequestParams
	{
		String Param(String name);
		String Route(String name);
		NameValueCollection QueryString { get; }
	}

	public interface IStimulsoftReportShim
	{
		void Inject(IServiceLocator loc);
		void SetupLicense(String license);
		ActionResult ExportStiReport(Stream stream, IStumulsoftReportInfo ri, String targetFormat, Boolean saveFile = true);
		Task<ExportReportResult> ExportStiReportStreamAsync(Stream input, IStumulsoftReportInfo ri, String targetFormat, Stream output);

		ActionResult CreateReportResult(Stream input, ReportInfo ri);
		ActionResult ViewerEvent();
		ActionResult Interaction();
		ActionResult PrintReport();
		ActionResult ExportReport();

		MvcHtmlString ShowViewer(Controller controller);
		IStimulsoftRequestParams GetViewerRequestParams();

		Task<String> ExportDocumentAsync(Stream input, IDataModel dataModel, Stream output);
	}
}

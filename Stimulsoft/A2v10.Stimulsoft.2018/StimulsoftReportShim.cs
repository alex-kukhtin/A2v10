// Copyright © 2021 Alex Kukhtin. All rights reserved.

using System;
using System.IO;
using System.Collections.Specialized;
using System.Web.Mvc;

using Stimulsoft.Report.Mvc;
using Stimulsoft.Base;
using Stimulsoft.Report;
using Stimulsoft.Report.Web;

using A2v10.Infrastructure;
using A2v10.Reports;
using A2v10.Data.Interfaces;
using System.Threading.Tasks;

namespace A2v10.Stimulsoft
{
	public class StimulsoftRequestParams : IStimulsoftRequestParams
	{
		private readonly StiRequestParams _prms;
		public StimulsoftRequestParams(StiRequestParams prms)
		{
			_prms = prms;
		}

		public String Param(String name)
		{
			return _prms.HttpContext.Request[name];
		}

		public String Route(String name)
		{
			return _prms.Routes[name];
		}

		public NameValueCollection QueryString => _prms.HttpContext.Request.QueryString;
	}

	public class StimulsoftReportShim : IStimulsoftReportShim
	{
		public void Inject(IServiceLocator loc)
		{
		}

		public void SetupLicense(String license)
		{
			StiLicense.LoadFromString(license);
		}

		public ActionResult ExportStiReport(Stream stream, IStumulsoftReportInfo ri, String targetFormat, Boolean saveFile = true)
		{
			var r = StiReportExtensions.CreateReport(stream, ri.Name);
			r.AddDataModel(ri.DataModel);
			if (ri.Variables != null)
				r.AddVariables(ri.Variables);
			if (targetFormat == "pdf")
				return StiMvcReportResponse.ResponseAsPdf(r, StiReportExtensions.GetPdfExportSettings(), saveFileDialog: saveFile);
			else if (targetFormat == "excel")
				return StiMvcReportResponse.ResponseAsExcel2007(r, StiReportExtensions.GetDefaultXlSettings(), saveFileDialog: saveFile);
			else if (targetFormat == "word")
				return StiMvcReportResponse.ResponseAsWord2007(r, StiReportExtensions.GetDefaultWordSettings(), saveFileDialog: saveFile);
			else if (targetFormat == "opentext")
				return StiMvcReportResponse.ResponseAsOdt(r, StiReportExtensions.GetDefaultOdtSettings(), saveFileDialog: saveFile);
			else if (targetFormat == "opensheet")
				return StiMvcReportResponse.ResponseAsOds(r, StiReportExtensions.GetDefaultOdsSettings(), saveFileDialog: saveFile);
			else
				throw new NotImplementedException($"Format '{targetFormat}' is not supported in this version");
		}

		public Task<ExportReportResult> ExportStiReportStreamAsync(Stream input, IStumulsoftReportInfo ri, String targetFormat, Stream output)
		{
			var r = StiReportExtensions.CreateReport(input, ri.Name);
			r.AddDataModel(ri.DataModel);
			var rr = new ExportReportResult();

			if (ri.Variables != null)
				r.AddVariables(ri.Variables);
			if (targetFormat == "pdf")
			{
				r.Render();
				r.ExportDocument(StiExportFormat.Pdf, output, StiReportExtensions.GetDefaultPdfSettings());
				rr.ContentType = "application/pdf";
				rr.Extension = "pdf";
			}
			else if (targetFormat == "excel")
			{
				r.Render();
				r.ExportDocument(StiExportFormat.Excel2007, output, StiReportExtensions.GetDefaultXlSettings());
				rr.ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
				rr.Extension = "xlsx";
			}
			else if (targetFormat == "word")
			{
				r.Render();
				r.ExportDocument(StiExportFormat.Word2007, output, StiReportExtensions.GetDefaultWordSettings());
				rr.ContentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
				rr.Extension = "docx";
			}
			else if (targetFormat == "opentext")
			{
				r.Render();
				r.ExportDocument(StiExportFormat.Odt, output, StiReportExtensions.GetDefaultOdtSettings());
				rr.ContentType = "application/vnd.oasis.opendocument.text";
				rr.Extension = "odt";
			}
			else if (targetFormat == "opensheet")
			{
				r.Render();
				r.ExportDocument(StiExportFormat.Ods, output, StiReportExtensions.GetDefaultOdsSettings());
				rr.ContentType = "application/vnd.oasis.opendocument.spreadsheet";
				rr.Extension = "ods";
			}
			else
				throw new NotImplementedException($"Format '{targetFormat}' is not supported in this version");
			return Task.FromResult(rr);
		}


		public ActionResult CreateReportResult(Stream input, ReportInfo ri)
		{
			var r = StiReportExtensions.CreateReport(input, ri.Name);
			r.AddDataModel(ri.DataModel);
			var vars = ri.Variables;
			if (vars != null)
				r.AddVariables(vars);
			return StiMvcViewer.GetReportResult(r);
		}

		public ActionResult ViewerEvent()
		{
			return StiMvcViewer.ViewerEventResult();
		}

		public ActionResult Interaction()
		{
			return StiMvcViewer.InteractionResult();
		}

		public ActionResult PrintReport()
		{
			return StiMvcViewer.PrintReportResult();
		}

		public ActionResult ExportReport()
		{
			return StiMvcViewer.ExportReportResult();
		}

		public MvcHtmlString ShowViewer(Controller controller)
		{
			var v = new StimulsoftViewer();
			return v.Show(controller as Controller);
		}

		public IStimulsoftRequestParams GetViewerRequestParams()
		{
			var rp = StiMvcViewer.GetRequestParams();
			return new StimulsoftRequestParams(rp);
		}

		public Task<String> ExportDocumentAsync(Stream input, IDataModel dataModel, Stream output)
		{
			var r = StiReportExtensions.CreateReport(input, String.Empty);
			r.AddDataModel(dataModel);
			r.Render();
			r.ExportDocument(StiExportFormat.Pdf, output, StiReportExtensions.GetDefaultPdfSettings());
			return Task.FromResult(r.ReportName);
		}
	}
}

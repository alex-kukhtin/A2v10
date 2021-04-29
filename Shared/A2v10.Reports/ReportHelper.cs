// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Threading.Tasks;
using System.Configuration;
using System.IO;
using System.Web.Mvc;
using System.Reflection;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using A2v10.Request;

namespace A2v10.Reports
{
	public static class StimulsoftVersion
	{
		public const Int32 ExpectedVersion = 1003;
	}

	public class ReportContext
	{
		public Int64 UserId;
		public Int32 TenantId;
		public Int64 CompanyId;
	}

	public class ReportInfo : IStumulsoftReportInfo
	{
		public IDataModel DataModel { get; set; }
		public String Name { get; set; }
		public ExpandoObject Variables { get; set; }

		public String ReportPath;
		public Byte[] ReportStream;
		public RequestReportType Type;
		public IList<String> XmlSchemaPathes;
		public String Encoding;
		public Boolean Validate;

		public Stream GetStream(IApplicationReader reader)
		{
			if (!String.IsNullOrEmpty(ReportPath))
				return reader.FileStreamFullPathRO(ReportPath);
			else if (ReportStream != null)
				return new MemoryStream(ReportStream);
			throw new InvalidOperationException("Invalid report stream mode");
		}
	}

	public sealed class ReportHelper
	{
		private readonly IApplicationHost _host;
		private readonly IDbContext _dbContext;
		private readonly ILocalizer _localizer;
		private readonly IStimulsoftReportShim _stimulsoftReportShim;

		public ReportHelper()
		{
			// DI ready
			IServiceLocator locator = ServiceLocator.Current;
			_host = locator.GetService<IApplicationHost>();
			_dbContext = locator.GetService<IDbContext>();
			_localizer = locator.GetService<ILocalizer>();
			_stimulsoftReportShim = locator.GetService<IStimulsoftReportShim>(sloc =>
			{
				var inst = System.Activator.CreateInstance("A2v10.Stimulsoft", "A2v10.Stimulsoft.StimulsoftReportShim");
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

		public async Task<ReportInfo> GetReportInfo(ReportContext context, String url, String id, ExpandoObject prms)
		{
			var appReader = _host.ApplicationReader;
			var ri = new ReportInfo();
			RequestModel rm = await RequestModel.CreateFromBaseUrl(_host, false, url);
			var rep = rm.GetReport();
			ri.Type = rep.type;

			if (rep.type == RequestReportType.xml)
			{
				if (rep.xmlSchemas != null)
				{
					ri.XmlSchemaPathes = new List<String>();
					foreach (var schema in rep.xmlSchemas)
						ri.XmlSchemaPathes.Add(appReader.MakeFullPath(rep.Path, schema + ".xsd"));
				}

				ri.Encoding = rep.encoding;
				ri.Validate = rep.validate;
			}

			prms.Set("UserId", context.UserId);
			if (_host.IsMultiTenant || context.TenantId != 0 /*hack for desktop*/)
				prms.Set("TenantId", context.TenantId);
			if (_host.IsMultiCompany)
				prms.Set("CompanyId", context.CompanyId);
			prms.Set("Id", id);
			prms.AppendIfNotExists(rep.parameters);

			ri.DataModel = await _dbContext.LoadModelAsync(rep.CurrentSource, rep.ReportProcedure, prms);

			CheckTypes(rep.Path, rep.checkTypes, ri.DataModel);

			// after query
			ExpandoObject vars = rep.variables;
			if (vars == null)
				vars = new ExpandoObject();
			vars.Set("UserId", context.UserId);
			if (_host.IsMultiTenant)
				vars.Set("TenantId", context.TenantId);
			if (_host.IsMultiCompany)
				vars.Set("CompanyId", context.CompanyId);
			vars.Set("Id", id);
			ri.Variables = vars;
			var repName = _localizer.Localize(null, String.IsNullOrEmpty(rep.name) ? rep.ReportName : rep.name);
			if (ri.DataModel != null && ri.DataModel.Root != null)
				repName = ri.DataModel.Root.Resolve(repName);
			ri.Name = repName;

			if (rep.ReportFromDataModel)
			{
				ri.ReportStream = ri.DataModel.Eval<Byte[]>(rep.ReportExpression);
				if (ri.ReportStream == null)
					throw new InvalidDataException($"Expression '{rep.ReportName}'  is null");
			}
			else if (rep.HasPath)
				ri.ReportPath = appReader.MakeFullPath(rep.Path, rep.ReportName + ".mrt");

			return ri;
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

		ITypeChecker CheckTypes(String path, String typesFile, IDataModel model)
		{
			if (!_host.IsDebugConfiguration)
				return null;
			if (String.IsNullOrEmpty(typesFile))
				return null;
			var tc = new TypeChecker(_host.ApplicationReader, path);
			tc.CreateChecker(typesFile, model);
			return tc;
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

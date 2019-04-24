// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Configuration;
using System.Collections.Generic;
using System.IO;
using System.Dynamic;

using Stimulsoft.Report.Export;
using Stimulsoft.Report;
using Stimulsoft.Report.Dictionary;
using Stimulsoft.Report.Web;

using A2v10.Data.Interfaces;

namespace A2v10.Reports
{
	public static class StiReportExtensions
	{
		public static StiPdfExportSettings GetDefaultPdfSettings()
		{
			return new Stimulsoft.Report.Export.StiPdfExportSettings()
			{
				EmbeddedFonts = true,
				UseUnicode = true,
				ImageResolution = 300,
				ImageCompressionMethod = StiPdfImageCompressionMethod.Flate
			};
		}

		public static StiExcelExportSettings GetDefaultXlSettings()
		{
			return new Stimulsoft.Report.Export.StiExcelExportSettings()
			{
				ExcelType = StiExcelType.Excel2007
			};
		}

		public static StiWord2007ExportSettings GetDefaultWordSettings()
		{
			return new Stimulsoft.Report.Export.StiWord2007ExportSettings()
			{
			};
		}

		public static StiOdtExportSettings GetDefaultOdtSettings()
		{
			return new Stimulsoft.Report.Export.StiOdtExportSettings()
			{
			};
		}

		public static StiOdsExportSettings GetDefaultOdsSettings()
		{
			return new Stimulsoft.Report.Export.StiOdsExportSettings()
			{
			};
		}

		public static StiPdfExportSettings GetPdfExportSettings()
		{
			var pdf = new StiPdfExportSettings
			{
				UseUnicode = true,
				EmbeddedFonts = true,
				ImageResolution = 300,
				ImageCompressionMethod = StiPdfImageCompressionMethod.Flate
			};
			return pdf;
		}

		public static StiDefaultExportSettings GetExportSettings()
		{
			var settings = new StiDefaultExportSettings();
			var pdf = settings.ExportToPdf;
			pdf.EmbeddedFonts = true;
			pdf.UseUnicode = true;
			pdf.ImageResolution = 300;
			pdf.ImageCompressionMethod = StiPdfImageCompressionMethod.Flate;

			var excel = settings.ExportToExcel;
			excel.ExcelType = StiExcelType.Excel2007;
			excel.ImageResolution = 300;
			return settings;
		}

		public static void AddReferencedAssemblies(this StiReport report)
		{
			Int32 asCount = 1;
			Int32 len = report.ReferencedAssemblies.Length;
			var ra = new String[len + asCount];
			Array.Copy(report.ReferencedAssemblies, ra, len);
			ra[len] = "A2v10.Infrastructure";
			report.ReferencedAssemblies = ra;
		}

		public static void SubstDataSources(this StiReport report)
		{
			var cns = ConfigurationManager.ConnectionStrings;
			foreach (var db in report.Dictionary.Databases)
			{
				if (db is StiSqlDatabase dbs)
				{
					var st = cns[dbs.Name];
					if (st != null)
						dbs.ConnectionString = st.ConnectionString;
				}
			}
		}

		public static StiReport CreateReport(Stream stream, String repName)
		{
			var r = new Stimulsoft.Report.StiReport();
			r.Load(stream);
			r.AddReferencedAssemblies();
			r.SubstDataSources();
			if (!String.IsNullOrEmpty(repName))
				r.ReportName = repName;
			return r;
		}

		public static void AddDataModel(this StiReport report, IDataModel dm)
		{
			if (dm == null)
				return;
			var dynModel = dm.GetDynamic();
			foreach (var x in dynModel)
			{
				report.RegBusinessObject(x.Key, x.Value);
			}
		}

		public static void AddVariables(this StiReport report, IDictionary<String, Object> vars)
		{
			if (vars == null)
				return;
			if (report?.Dictionary?.Variables?.Items == null)
				return;
			foreach (var vp in vars)
			{
				if (vp.Value != null)
				{
					foreach (var xs in report?.Dictionary?.Variables?.Items)
					{
						if (xs.Name == vp.Key)
						{
							xs.ValueObject = vp.Value;
							xs.Type = vp.Value.GetType();
						}
					}
				}
			}
		}
	}
}

// Copyright © 2022 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.IO;
using System.Reflection;
using A2v10.Infrastructure;

namespace A2v10.Reports
{
	public class PdfReportHelper
	{
		private readonly IApplicationHost _host;
		private readonly IPdfReportShim _pdfReportShim;
		public PdfReportHelper(IApplicationHost host)
		{
			_host = host;
			IServiceLocator locator = host.Locator;
			_pdfReportShim = locator.GetService<IPdfReportShim>(sloc =>
			{
				var inst = System.Activator.CreateInstance("A2v10.Pdf.Report", "A2v10.Pdf.Report.PdfReportShim");
				if (inst == null)
					throw new ArgumentNullException("A2v10.Stimulsoft");
				var instUnwrap = inst.Unwrap();
				var ass = Assembly.GetAssembly(instUnwrap.GetType());

				var shim = instUnwrap as IPdfReportShim;
				shim.Inject(sloc.GetService<ILocalizer>(), sloc.GetService<IUserLocale>());
				return shim;
			});
		}

		public Stream Build(String path, ExpandoObject data)
		{
			return _pdfReportShim.Build(path, data);
		}
	}
}

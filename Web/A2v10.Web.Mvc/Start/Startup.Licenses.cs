// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using A2v10.Reports;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Hosting;

namespace A2v10.Web.Mvc.Start
{
	public partial class Startup
	{
		public void SetLicenses()
		{
			ReportEngine.SetLicense(HostingEnvironment.MapPath("~"));
		}
	}
}

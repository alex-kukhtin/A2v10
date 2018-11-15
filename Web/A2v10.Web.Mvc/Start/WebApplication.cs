// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Configuration;
using System.Diagnostics;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace A2v10.Web.Mvc.Start
{
	public class WebApplication : System.Web.HttpApplication
	{
		protected void Application_Start()
		{
			AreaRegistration.RegisterAllAreas();
			FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
			RouteConfig.RegisterRoutes(RouteTable.Routes);

			Debug.Assert(ViewEngines.Engines[0] is WebFormViewEngine);
			ViewEngines.Engines.RemoveAt(0); // WebForm is not used
			var siteMode = ConfigurationManager.AppSettings["siteMode"];
			if (siteMode == "site") {
				var razor = ViewEngines.Engines[0] as RazorViewEngine;
				var appKey = ConfigurationManager.AppSettings["appKey"];
				razor.PartialViewLocationFormats = new String[]
				{
					$"~/App_Apps/{appKey}/{{1}}/{{0}}.cshtml",
					$"~/App_Apps/{appKey}/Shared/{{0}}.cshtml",
				};
			}
		}
	}
}

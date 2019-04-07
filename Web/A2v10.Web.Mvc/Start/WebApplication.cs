// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System.Web.Mvc;
using System.Web.Routing;

using A2v10.Web.Base.Start;

namespace A2v10.Web.Mvc.Start
{
	public class WebApplication : System.Web.HttpApplication
	{
		protected void Application_Start()
		{
			//AreaRegistration.RegisterAllAreas();
			FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
			RouteConfig.RegisterRoutes(RouteTable.Routes);
			ViewEnginesConfig.SetupViewEngines(ViewEngines.Engines);
		}
	}
}

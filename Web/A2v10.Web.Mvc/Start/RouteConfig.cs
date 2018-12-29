// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Configuration;
using System.Web.Mvc;
using System.Web.Routing;

namespace A2v10.Web.Mvc.Start
{
	public class RouteConfig
	{
		public static void RegisterRoutes(RouteCollection routes)
		{
			routes.IgnoreRoute("{resource}.axd/{*pathInfo}");
			routes.IgnoreRoute("Content/{resource}/{*pathInfo}");
			routes.IgnoreRoute("Scripts/{resource}/{*pathInfo}");
			routes.IgnoreRoute("fonts/{resource}/{*pathInfo}");
			routes.IgnoreRoute("favicon.ico");

			var siteMode = ConfigurationManager.AppSettings["siteMode"];

			routes.MapRoute(
				name: "Account",
				url: "Account/{action}",
				defaults: new { controller = "Account" }
			);

			routes.MapRoute(
				name: "AppLink",
				url: "AppLink/{*pathInfo}",
				defaults: new { controller = "AppLink", action="Default" }
			);

			routes.MapRoute(
				name: "Report",
				url: "Report/{action}/{id}",
				defaults: new { controller = "Report" }
			);

			routes.MapRoute(
				name: "Attachment",
				url: "Attachment/{action}/{id}",
				defaults: new { controller = "Attachment" }
			);

			routes.MapRoute(
				name: "EUSign",
				url: "EUSign/{action}/{id}",
				defaults: new { controller = "EUSign" }
			);

			routes.MapRoute(
				name: "Api",
				url: "Api/{*pathInfo}",
				defaults: new { controller = "Api", action="Default" }
			);

			routes.MapRoute(
				name: "Static",
				url: "Static/{*pathInfo}",
				defaults: new { controller = "Static", action = "Default" }
			);

			routes.MapRoute(
				name: "Demo",
				url: "Demo",
				defaults: new { controller = "Account", action = "Demo" }
			);

			if (siteMode == "site")
				RegisterSiteRoutes(routes);
			else
				RegisterAppRoutes(routes);
		}

		static void RegisterAppRoutes(RouteCollection routes)
		{
			routes.MapRoute(
				name: "Default",
				url: "{*pathInfo}",
				defaults: new { controller = "Shell", action = "Default" },
				/*avoid duplicate controller names*/
				namespaces: new[] { "A2v10.Web.Mvc.Controllers" }
			);
		}

		static void RegisterSiteRoutes(RouteCollection routes)
		{
			routes.MapRoute(
				name: "Default",
				url: "{*pathInfo}",
				defaults: new { controller = "Site", action = "Default" },
				/*avoid duplicate controller names*/
				namespaces: new[] { "A2v10.Web.Mvc.Controllers" }
			);
		}

	}
}

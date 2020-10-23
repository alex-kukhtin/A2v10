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
			routes.IgnoreRoute("content/{resource}/{*pathInfo}");
			routes.IgnoreRoute("css/{resource}/{*pathInfo}");
			routes.IgnoreRoute("scripts/{resource}/{*pathInfo}");
			routes.IgnoreRoute("fonts/{resource}/{*pathInfo}");
			routes.IgnoreRoute("*.ico");
			routes.IgnoreRoute("*.png");
			routes.IgnoreRoute("robots.txt");
			routes.IgnoreRoute("manifest.json");

			var siteMode = ConfigurationManager.AppSettings["siteMode"];

			routes.MapRoute(
				name: "Account",
				url: "Account/{action}",
				defaults: new { controller = "Account" }
			);

			foreach (var name in new String[] { "Report", "Attachment", "EUSign" })
			{
				routes.MapRoute(
					name: name,
					url: $"{name}/{{action}}/{{id}}",
					defaults: new { controller = name }
				);
			}

			foreach (var name in new String[] {"Api", "ApiV2", "Static", "AppLink" })
			{
				routes.MapRoute(
					name: name,
					url: $"{name}/{{*pathInfo}}",
					defaults: new { controller = name, action = "Default" }
				);
			}

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

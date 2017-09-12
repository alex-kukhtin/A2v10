using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
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

            routes.MapRoute(
                name: "Account",
                url: "Account/{action}",
                defaults: new { controller = "Account" }
            );

            routes.MapRoute(
                name: "Shell",
                url: "Shell/{action}",
                defaults: new { controller = "Shell" }
            );

            routes.MapRoute(
                name: "Page",
                url: "_page/{*pathInfo}",
                defaults: new { controller = "Shell", action = "Page" }
            );

            routes.MapRoute(
                name: "Dialog",
                url: "_dialog/{*pathInfo}",
                defaults: new { controller = "Element", action = "Dialog" }
            );

            routes.MapRoute(
                name: "Popup",
                url: "_popup/{*pathInfo}",
                defaults: new { controller = "Element", action = "Popup" }
            );

            routes.MapRoute(
                name: "Data",
                url: "_data/{*command}",
                defaults: new { controller = "Element", action = "Data" }
            );

            routes.MapRoute(
				name: "Default",
				url: "{*pathInfo}",
				defaults: new { controller = "Shell", action = "Index"}
			);
		}
	}
}

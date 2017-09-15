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
                name: "Default",
                url: "{*pathInfo}",
                defaults: new { controller = "Shell", action = "Default" },
                /*avoid duplicate controller names*/
                namespaces: new[] { "A2v10.Web.Mvc.Controllers" }
            );

            /*
            routes.MapRoute(
                name: "Shell",
                url: "Shell/{action}",
                defaults: new { controller = "Shell" },
                /*avoid duplicate controller names* /
                namespaces: new[] { "A2v10.Web.Mvc.Controllers" }
            );
            */
        }
    }
}

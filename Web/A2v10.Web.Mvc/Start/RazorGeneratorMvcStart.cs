// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System.Web;
using System.Web.Mvc;
using System.Web.WebPages;
//using RazorGenerator.Mvc;

[assembly: WebActivatorEx.PostApplicationStartMethod(typeof(A2v10.Web.Mvc.Start.RazorGeneratorMvcStart), "Start")]

namespace A2v10.Web.Mvc.Start
{
    public static class RazorGeneratorMvcStart
	{
        public static void Start()
		{
			/*
            var engine = new PrecompiledMvcEngine(typeof(RazorGeneratorMvcStart).Assembly) {
                UsePhysicalViewsIfNewer = HttpContext.Current.Request.IsLocal
            };

            ViewEngines.Engines.Insert(0, engine);
            // StartPage lookups are done by WebPages. 
            VirtualPathFactoryManager.RegisterVirtualPathFactory(engine);
			*/
        }
    }
}

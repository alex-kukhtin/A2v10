// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Configuration;
using System.Web.Mvc;

namespace A2v10.Web.Base
{
	public static class ViewEngineExtensions
	{
		public static void SetupEngineForSite(this IViewEngine engine)
		{ 
			var siteMode = ConfigurationManager.AppSettings["siteMode"];
			if (siteMode == "site")
			{
				if (engine is RazorViewEngine razor)
				{
					var appKey = AppConfig.AppKey();
					var appPath = AppConfig.AppPath();
					razor.PartialViewLocationFormats = new String[]
					{
						$"{appPath}{appKey}/Shared/{{0}}.cshtml"
					};
					razor.MasterLocationFormats = new String[]
					{
						$"{appPath}{appKey}/Shared/{{0}}.cshtml"
					};
					razor.ViewLocationFormats = new String[]
					{
						$"{appPath}{appKey}/Shared/{{0}}.cshtml"
					};
				}
			}
		}
	}
}

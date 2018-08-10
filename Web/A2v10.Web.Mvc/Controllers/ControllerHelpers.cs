// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;

using Newtonsoft.Json;

using A2v10.Infrastructure;

namespace A2v10.Web.Mvc.Controllers
{
	public static class ControllerHelpers
	{
		public static String AppLinks(IApplicationHost host)
		{
			var appPath = host.MakeFullPath(false, "", "links.json");
			if (System.IO.File.Exists(appPath))
			{
				String appLinks = System.IO.File.ReadAllText(appPath);
				Object links = JsonConvert.DeserializeObject<List<Object>>(appLinks);
				return JsonConvert.SerializeObject(links);
			}
			return "[]";
		}
	}
}

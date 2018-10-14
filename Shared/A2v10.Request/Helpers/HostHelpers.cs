// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.IO;

using Newtonsoft.Json;

using A2v10.Infrastructure;

namespace A2v10.Request
{
	public static class HostHelpers
	{
		public static String AppStyleSheetsLink(this IApplicationHost host, String controllerName)
		{
			controllerName = controllerName ?? throw new ArgumentNullException(nameof(controllerName));
			// TODO _host AssestsDistionary
			var fp = host.MakeFullPath(false, "_assets", "");
			if (!Directory.Exists(fp))
				return String.Empty;
			foreach (var f in Directory.EnumerateFiles(fp, "*.css"))
			{
				// at least one file
				return $"<link  href=\"/{controllerName.ToLowerInvariant()}/appstyles\" rel=\"stylesheet\" />";
			}
			return String.Empty;
		}

		public static String AppLinks(this IApplicationHost host)
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

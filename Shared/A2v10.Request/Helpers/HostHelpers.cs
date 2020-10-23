// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.IO;

using Newtonsoft.Json;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using System.Threading.Tasks;

namespace A2v10.Request
{
	public static class HostHelpers
	{
		public static String AppStyleSheetsLink(this IApplicationHost host, String controllerName)
		{
			controllerName = controllerName ?? throw new ArgumentNullException(nameof(controllerName));
			// TODO _host AssestsDistionary
			var files = host.ApplicationReader.EnumerateFiles("_assets", "*.css");
			if (files == null)
				return String.Empty;
			// at least one file
			foreach (var f in files)
				return $"<link  href=\"/{controllerName.ToLowerInvariant()}/appstyles\" rel=\"stylesheet\" />";
			return String.Empty;
		}

		public static String AppLinks(this IApplicationHost host)
		{
			String appLinks = host.ApplicationReader.ReadTextFile(String.Empty, "links.json");
			if (appLinks != null)
			{
				// with validation
				Object links = JsonConvert.DeserializeObject<List<Object>>(appLinks);
				return JsonConvert.SerializeObject(links);
			}
			return "[]";
		}

		public static String CustomAppHead(this IApplicationHost host)
		{
			String head = host.ApplicationReader.ReadTextFile("_layout", "_head.html");
			return head != null ? host.GetAppSettings(head) : String.Empty;
		}

		public static String CustomAppScripts(this IApplicationHost host)
		{
			String scripts = host.ApplicationReader.ReadTextFile("_layout", "_scripts.html");
			return scripts != null ?  host.GetAppSettings(scripts) : String.Empty;
		}

		public static String CustomManifest(this IApplicationHost host)
		{
			var manifestPath = Path.Combine(host.HostingPath, "manifest.json");
			return File.Exists(manifestPath) ? "<link rel=\"manifest\" href=\"/manifest.json\">" : null;
		}

		public static Task ProcessDbEvents(this IApplicationHost host, IDbContext dbContext)
		{
			return ProcessDbEventsCommand.ProcessDbEvents(dbContext, host.CatalogDataSource, host.IsAdminMode);
		}

		public static ITypeChecker CheckTypes(this IApplicationHost host, String path, String typesFile, IDataModel model)
		{
			if (!host.IsDebugConfiguration)
				return null;
			if (String.IsNullOrEmpty(typesFile))
				return null;
			var tc = new TypeChecker(host.ApplicationReader, path);
			tc.CreateChecker(typesFile, model);
			return tc;
		}

	}
}

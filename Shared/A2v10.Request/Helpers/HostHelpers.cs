// Copyright © 2015-2023 Oleksandr  Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.IO;

using Newtonsoft.Json;

using System.Threading.Tasks;
using System.Text;
using System.Dynamic;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;

namespace A2v10.Request;

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
		foreach (var _ in files)
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

	public static String GetExternalAppFileName(IApplicationHost host, String path, String fileName)
	{
		var obj = host.GetAppSettingsObject("externalApplication");
		if (obj != null)
		{
			String appName = obj.Get<String>("name");
			var fn = fileName.Split('.');
			if (fn.Length != 2)
				return fileName;
			String extFileName = $"{fn[0]}.{appName}.{fn[1]}";

			var extFullPath = host.ApplicationReader.MakeFullPath(path, extFileName);
			if (host.ApplicationReader.FileExists(extFullPath))
				return extFileName;
		}
		return fileName;
	}

	public static String GetAppData(this IApplicationHost host, ILocalizer localizer, IUserLocale userLocale)
	{
		var obj = host.GetAppSettingsObject("externalApplication");
		String fileName = GetExternalAppFileName(host, String.Empty, "app.json");
		var appJson = host.ApplicationReader.ReadTextFile(String.Empty, fileName);
		if (appJson != null)
		{
			if (appJson.Contains("$(")) {
				var sb = new StringBuilder(appJson);
				sb.Replace("$(lang)", userLocale.Language)
				  .Replace("$(lang2)", userLocale.Language2);
				appJson = sb.ToString();
			}
			// with validation
			ExpandoObject app = JsonConvert.DeserializeObject<ExpandoObject>(appJson);
			app.Set("embedded", host.Embedded);
			return localizer.Localize(null, JsonConvert.SerializeObject(app));
		}

		ExpandoObject defAppData = new();
		defAppData.Set("version", host.AppVersion);
		defAppData.Set("title", "A2v10 Web Application");
		defAppData.Set("copyright", host.Copyright);
		defAppData.Set("embedded", host.Embedded);
		return JsonConvert.SerializeObject(defAppData);
	}

	public static String CustomAppHead(this IApplicationHost host)
	{
		String head = host.ApplicationReader.ReadTextFile("_layout", "_head.html");
		if (head == null)
			return String.Empty;
		return head.Replace("$(UserName)", host.UserName);
	}
    public static String CustomAppBody(this IApplicationHost host)
    {
        String head = host.ApplicationReader.ReadTextFile("_layout", "_body.html");
        if (head == null)
            return String.Empty;
        return head.Replace("$(UserName)", host.UserName);
    }

    public static String CustomAppScripts(this IApplicationHost host)
	{
		var fileName = GetExternalAppFileName(host, "_layout", "_scripts.html");
		String scripts = host.ApplicationReader.ReadTextFile("_layout", fileName);
		return scripts != null ?  host.GetAppSettings(scripts) : String.Empty;
	}

	public static String CustomManifest(this IApplicationHost host)
	{
		var manifestPath = Path.Combine(host.HostingPath, "manifest.json");
		return File.Exists(manifestPath) ? "<link rel=\"manifest\" href=\"/manifest.json\">" : null;
	}

	public static String AppleTouchIcon(this IApplicationHost host)
	{
		var touchIconPath = Path.Combine(host.HostingPath, "touch-icon-iphone.png");
		return File.Exists(touchIconPath) ? "<link rel=\"apple-touch-icon\"  href=\"/touch-icon-iphone.png\">" : null;
	}


	public static String GetSiteMetaTags(this IApplicationHost appHost, String siteHost)
	{
		if (String.IsNullOrEmpty(siteHost))
			return String.Empty;
		Int32 dotPos = siteHost.IndexOfAny(":".ToCharArray());
		if (dotPos != -1)
			siteHost = siteHost.Substring(0, dotPos);
		siteHost = siteHost.Replace('.', '_').ToLowerInvariant();
		String metaText = appHost.ApplicationReader.ReadTextFile("_meta/", $"{siteHost}.head");
		if (metaText != null)
			return metaText;
		return String.Empty;
	}

	public static void ReplaceMacros(this IApplicationHost host, StringBuilder sb, String controllerName = "_shell")
	{
		sb.Replace("$(Build)", host.AppBuild);
		sb.Replace("$(LayoutHead)", host.CustomAppHead());
        sb.Replace("$(LayoutBody)", host.CustomAppBody());
        sb.Replace("$(AppleTouchIcon)", host.AppleTouchIcon());
		sb.Replace("$(LayoutManifest)", host.CustomManifest());
		sb.Replace("$(AssetsStyleSheets)", host.AppStyleSheetsLink(controllerName));
		sb.Replace("$(HelpUrl)", host.HelpUrl);
		sb.Replace("$(Description)", host.AppDescription);
		var theme = host.Theme;
		sb.Replace("$(ColorScheme)", theme?.ColorScheme ?? null);
		sb.Replace("$(Theme)", theme?.FileName ?? null);
		sb.Replace("$(ThemeTimeStamp)", theme?.ThemeTimeStamp ?? null);
	}


	public static Task ProcessDbEvents(this IApplicationHost host, IDbContext dbContext, String source)
	{
		return ProcessDbEventsCommand.ProcessDbEvents(dbContext, source, host.IsAdminMode);
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

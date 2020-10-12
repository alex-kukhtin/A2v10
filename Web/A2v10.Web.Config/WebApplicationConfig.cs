// Copyright © 2020 Alex Kukhtin. All rights reserved.

using System;
using System.Configuration;
using System.IO;
using System.Web.Hosting;
using A2v10.Infrastructure;

namespace A2v10.Web.Config
{

	public class ThemeInfo : ITheme
	{
		public ThemeInfo(String text, String hostingPath)
		{
			Name = text ?? String.Empty;
			FileName = "site";
			String schemeName = null;
			if (Name.Contains("."))
			{
				var tx = Name.Split('.');
				Name = tx[0].Trim();
				schemeName = tx[1].Trim();
			}
			if (Name == "advance" && String.IsNullOrEmpty(schemeName))
				schemeName = "default";

			if (!String.IsNullOrEmpty(Name))
				FileName += $".{Name.ToLowerInvariant()}";

			if (!String.IsNullOrEmpty(schemeName))
			{
				var schemePath = Path.Combine(hostingPath, "css", $"{schemeName}.colorscheme");
				if (File.Exists(schemePath))
				{
					ColorScheme = $"style=\"{File.ReadAllText(schemePath).RemoveEOL()}\"";
				}
			}
		}
		public String Name { get; }
		public String FileName { get; }
		public String ColorScheme { get; }
	}

	public class WebApplicationConfig : IApplicationConfig
	{
		public Boolean IsDebugConfiguration
		{
			get
			{
				var debug = ConfigurationManager.AppSettings["configuration"];
				if (String.IsNullOrEmpty(debug))
					return true; // default is 'debug'
				return debug.ToLowerInvariant() == "debug";
			}
		}

		public String AppPath
		{
			get
			{
				String path = ConfigurationManager.AppSettings["appPath"];
				if (path == null)
					path = "~/App_application";
				if (path.StartsWith("~"))
					path = HostingEnvironment.MapPath(path);
				return path;
			}
		}
		public String AppKey => ConfigurationManager.AppSettings["appKey"] ?? String.Empty;

		public String ScriptEngine => ConfigurationManager.AppSettings["scriptEngine"];
		public String AppDescription => ConfigurationManager.AppSettings["appDescription"];
		public String AppHost => ConfigurationManager.AppSettings["appHost"];
		public String UserAppHost => ConfigurationManager.AppSettings["userAppHost"];
		public String HelpUrl => ConfigurationManager.AppSettings["helpUrl"];
		public String SupportEmail => ConfigurationManager.AppSettings["supportEmail"];
		public String SmtpConfig => ConfigurationManager.AppSettings["mailSettings"];

		public String CustomSecuritySchema => ConfigurationManager.AppSettings[AppHostKeys.customSecuritySchema];
		public String UseClaims => ConfigurationManager.AppSettings["useClaims"];

		public String HostingPath => HostingEnvironment.MapPath("~");

		public ITheme Theme => new ThemeInfo(ConfigurationManager.AppSettings["theme"], HostingPath);
	}
}

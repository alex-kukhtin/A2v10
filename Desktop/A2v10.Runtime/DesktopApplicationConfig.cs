// Copyright © 2020 Alex Kukhtin. All rights reserved.

using System;
using System.IO;
using System.Reflection;
using A2v10.Infrastructure;

namespace A2v10.Runtime
{
	public class DesktopApplicationConfig : IApplicationConfig
	{
		private static String CurrentAppPath { get; set; }
		private static String CurrentAppKey { get; set; }
		private static String CurrentHelpUrl { get; set; }

		public Boolean IsDebugConfiguration => true;

		public String AppPath => CurrentAppPath;
		public String AppKey => CurrentAppKey;

		public ITheme Theme => null;

		public String ScriptEngine => null;

		public String HostingPath
		{
			get
			{
				var path = Assembly.GetExecutingAssembly().Location;
				return Path.GetDirectoryName(path);
			}
		}

		public String AppDescription => "A2v10.Desktop";
		public String AppHost => null;
		public String UserAppHost => null;
		public String SupportEmail => null;
		public String HelpUrl => CurrentHelpUrl;
		public String SmtpConfig => throw new NotImplementedException(nameof(SmtpConfig));

		public String CustomSecuritySchema => null;
		public String UseClaims => null;

		public static void StartApplication(AppConfiguration config)
		{
			CurrentAppPath = config.AppPath;
			CurrentAppKey = config.AppKey;
			CurrentHelpUrl = config.HelpUrl;
		}
	}
}

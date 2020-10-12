// Copyright © 2020 Alex Kukhtin. All rights reserved.

using System;
using System.Configuration;
using A2v10.Infrastructure;

namespace BackgroundProcessor
{
	public class BackgroundApplicationConfig : IApplicationConfig
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

		public String AppPath => ConfigurationManager.AppSettings["appPath"];
		public String AppKey => ConfigurationManager.AppSettings["appKey"] ?? String.Empty;

		public String HostingPath => throw new NotImplementedException(nameof(HostingPath));

		public ITheme Theme => throw new NotImplementedException(nameof(Theme));

		public String ScriptEngine => ConfigurationManager.AppSettings["scriptEngine"];

		public String AppHost => ConfigurationManager.AppSettings["appHost"];
		public String UserAppHost => ConfigurationManager.AppSettings["userAppHost"];
		public String AppDescription => throw new NotImplementedException(nameof(AppDescription));

		public String SmtpConfig => ConfigurationManager.AppSettings["mailSettings"];

		public String SupportEmail => throw new NotImplementedException(nameof(SupportEmail));
		public String HelpUrl => throw new NotImplementedException(nameof(HelpUrl));

		public String CustomSecuritySchema => ConfigurationManager.AppSettings[AppHostKeys.customSecuritySchema];
		public String UseClaims => throw new NotImplementedException(nameof(UseClaims));
	}
}

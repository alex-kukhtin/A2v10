// Copyright © 2020 Alex Kukhtin. All rights reserved.

using System;
using System.Configuration;
using A2v10.Infrastructure;

namespace A2v10.Tests.Config
{
	public class TestApplicationConfig : IApplicationConfig
	{
		public Boolean IsDebugConfiguration => true;

		public String AppPath => ConfigurationManager.AppSettings["appPath"];
		public String AppKey => ConfigurationManager.AppSettings["appKey"] ?? String.Empty;

		public String HostingPath { get; set; }
		public ITheme Theme => null;

		public String ScriptEngine => "ChakraCore";

		public String AppDescription => ConfigurationManager.AppSettings["appDescription"];
		public String AppHost => ConfigurationManager.AppSettings["appHost"];
		public String UserAppHost => ConfigurationManager.AppSettings["userAppHost"];

		public String SupportEmail => ConfigurationManager.AppSettings["supportEmail"];
		public String SmtpConfig => ConfigurationManager.AppSettings["mailSettings"];

		public String UseClaims => ConfigurationManager.AppSettings["useClaims"];
		public String CustomSecuritySchema => ConfigurationManager.AppSettings[AppHostKeys.customSecuritySchema];

		public String HelpUrl => null;
	}
}

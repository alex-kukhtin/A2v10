// Copyright © 2020 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Infrastructure
{
	public interface ITheme
	{
		String Name { get; }
		String FileName { get; }
		String ColorScheme { get; }
	}

	public interface IApplicationConfig
	{
		Boolean IsDebugConfiguration { get; }

		String AppPath { get; }
		String AppKey { get; }

		ITheme Theme { get; }
		String HostingPath { get; }

		String ScriptEngine { get; }

		String AppDescription { get; }
		String AppHost { get; }
		String UserAppHost { get; }
		String SupportEmail { get; }
		String HelpUrl { get; }
		String SmtpConfig { get; }

		String CustomSecuritySchema { get; }
		String UseClaims { get; }
	}
}

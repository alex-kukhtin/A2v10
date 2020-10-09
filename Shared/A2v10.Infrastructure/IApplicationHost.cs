// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;

namespace A2v10.Infrastructure
{
	public static class AppHostKeys
	{
		public const String customSecuritySchema = "customSecuritySchema";
	}

	public interface ITheme
	{
		String Name { get; }
		String FileName { get; }
		String ColorScheme { get; }
	}

	public interface IApplicationHost
	{
		IProfiler Profiler { get; }

		String AppPath { get; }
		String AppKey { get; }
		String AppDescription { get; }
		String AppHost { get; }
		String UserAppHost { get; }
		String SupportEmail { get; }
		ITheme Theme { get; }
		String HelpUrl { get; }
		String HostingPath { get; }
		String SmtpConfig { get; }
		Boolean Mobile { get; set; }
		Boolean Embedded { get; }
		Boolean IsAdminMode { get; }
		String ScriptEngine { get; }
	
		Boolean IsDebugConfiguration { get; }
		Boolean IsRegistrationEnabled { get; }
		Boolean IsDTCEnabled { get; }
		Boolean IsAdminAppPresent { get; }

		String UseClaims { get; }

		Boolean IsMultiTenant { get; }
		Boolean IsMultiCompany { get; }
		String CustomSecuritySchema { get; }
		Boolean IsUsePeriodAndCompanies { get; }

		Int32? TenantId { get; set; }
		Int64? UserId { get; set; }
		String UserSegment { get; set; }

		IApplicationReader ApplicationReader { get; }

		String ConnectionString(String source);
		String CatalogDataSource { get; }
		String TenantDataSource { get; }

		void SetAdmin(bool bAdmin);
		void StartApplication(Boolean bAdmin);

		String MakeRelativePath(String path, String fileName);

		String AppVersion { get; }
		String AppBuild { get; }
		String Copyright { get; }

		String GetAppSettings(String source);
		ExpandoObject GetEnvironmentObject(String key);
	}
}

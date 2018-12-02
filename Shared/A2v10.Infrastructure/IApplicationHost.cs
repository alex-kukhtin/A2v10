// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Threading.Tasks;

namespace A2v10.Infrastructure
{
	public interface IApplicationHost
	{
		IProfiler Profiler { get; }

		String AppPath { get; }
		String AppKey { get; }
		String AppDescription { get; }
		String SupportEmail { get; }
		String Theme { get; }
		String HelpUrl { get; }
		Boolean IsDebugConfiguration { get; }
		Boolean IsRegistrationEnabled { get; }

		String UseClaims { get; }

		Boolean IsMultiTenant { get; }
		Int32? TenantId { get; set; }

		String ConnectionString(String source);
		String CatalogDataSource { get; }
		String TenantDataSource { get; }

		String MakeFullPath(Boolean bAdmin, String path, String fileName);
		String MakeRelativePath(String path, String fileName);
		Task<String> ReadTextFileAsync(Boolean bAdmin, String path, String fileName);
		String ReadTextFile(Boolean bAdmin, String path, String fileName);

		String AppVersion { get; }
		String AppBuild { get; }
		String Copyright { get; }
	}
}

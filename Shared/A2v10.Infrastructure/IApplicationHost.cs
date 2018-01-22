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
        Boolean IsDebugConfiguration { get; }
        Boolean IsMultiTenant { get; }

        String ConnectionString(String source);
        String MakeFullPath(Boolean bAdmin, String path, String fileName);
        Task<String> ReadTextFile(Boolean bAdmin, String path, String fileName);

        String AppVersion { get; }
        String AppBuild { get; }
	}
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Infrastructure
{
	public interface IApplicationHost
	{
		String ConnectionString { get; }
		IProfiler Profiler { get; }
        String AppPath { get; }
        String AppKey { get; }

        String MakeFullPath(String path, String fileName);
        Task<String> ReadTextFile(String path, String fileName);
	}
}

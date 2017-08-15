using A2v10.Data;
using A2v10.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Tests.Config
{
	public static class TestConfig
	{
		static Lazy<IProfiler> Profiler = new Lazy<IProfiler>(() => new TestProfiler());
		static Lazy<IApplicationHost> AppHost = new Lazy<IApplicationHost>(() => new TestApplicationHost(Profiler.Value));
		static Lazy<IDbContext> _dbContext = new Lazy<IDbContext>(() => new SqlDbContext(AppHost.Value));

		public static IDbContext DbContext { get { return _dbContext.Value; } }
	}
}

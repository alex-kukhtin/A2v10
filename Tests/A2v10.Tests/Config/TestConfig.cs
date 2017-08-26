using A2v10.Data;
using A2v10.Infrastructure;
using A2v10.Workflow;
using A2v10.Xaml;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Tests.Config
{
	public static class TestConfig
	{
		public static Lazy<IProfiler> Profiler = new Lazy<IProfiler>(() => new TestProfiler());
        public static Lazy<IApplicationHost> AppHost = new Lazy<IApplicationHost>(() => new TestApplicationHost(Profiler.Value));
        public static Lazy<IDbContext> DbContext = new Lazy<IDbContext>(() => new SqlDbContext(AppHost.Value));
        public static Lazy<IWorkflowEngine> WorkflowEngine = new Lazy<IWorkflowEngine>(() => new WorkflowEngine(AppHost.Value, DbContext.Value));
        public static Lazy<IRenderer> Renderer = new Lazy<IRenderer>(() => new XamlRenderer());
    }
}

using A2v10.Data;
using A2v10.Infrastructure;
using A2v10.Workflow;
using A2v10.Xaml;
using System;

namespace A2v10.Tests.Config
{
	public class TestConfig
	{
		public static Lazy<IProfiler> Profiler = new Lazy<IProfiler>(() => new TestProfiler());
        public static Lazy<IApplicationHost> AppHost = new Lazy<IApplicationHost>(() => new TestApplicationHost(Profiler.Value));
        public static Lazy<IDbContext> DbContext = new Lazy<IDbContext>(() => new SqlDbContext(AppHost.Value));
        public static Lazy<IWorkflowEngine> WorkflowEngine = new Lazy<IWorkflowEngine>(() => new WorkflowEngine(AppHost.Value, DbContext.Value));
        public static Lazy<IRenderer> Renderer = new Lazy<IRenderer>(() => new XamlRenderer());

        public TestConfig()
        {
            ServiceLocator.Current.RegisterService<IDbContext>(DbContext.Value);
            ServiceLocator.Current.RegisterService<IWorkflowEngine>(WorkflowEngine.Value);
            ServiceLocator.Current.RegisterService<IApplicationHost>(AppHost.Value);
            ServiceLocator.Current.RegisterService<IProfiler>(Profiler.Value);
        }
    }
}

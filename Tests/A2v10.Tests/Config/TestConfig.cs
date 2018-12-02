// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using A2v10.Data;
using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using A2v10.Request;
using A2v10.Workflow;
using A2v10.Xaml;

namespace A2v10.Tests.Config
{
	public class TestConfig
	{
		private static IServiceLocator _currentService;

		public static void Start()
		{
			if (ServiceLocator.Start != null)
				return;

			ServiceLocator.Start = (IServiceLocator service) =>
			{
				var profiler = new TestProfiler();
				var host = new TestApplicationHost(profiler);
				var localizer = new TestLocalizer();
				var dbContext = new SqlDbContext(profiler, host, localizer);
				var workflowEngine = new WorkflowEngine(host, dbContext);
				var renderer = new XamlRenderer(profiler, host);
				var scripter = new VueDataScripter(host, localizer);

				service.RegisterService<IDbContext>(dbContext);
				service.RegisterService<IWorkflowEngine>(workflowEngine);
				service.RegisterService<IApplicationHost>(host);
				service.RegisterService<IProfiler>(profiler);
				service.RegisterService<IRenderer>(renderer);
				service.RegisterService<IDataScripter>(scripter);
				_currentService = service;
			};

			ServiceLocator.GetCurrentLocator = () =>
			{
				if (_currentService == null)
					new ServiceLocator();
				return _currentService;
			};
		}
	}
}

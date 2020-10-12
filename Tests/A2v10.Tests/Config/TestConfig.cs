// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using A2v10.Data;
using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using A2v10.Request;
using A2v10.Workflow;
using A2v10.Xaml;
using System.IO;

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
				var profiler = new NullProfiler();
				var config = new TestApplicationConfig()
				{
					HostingPath = Path.GetFullPath("../../../../Web/A2v10.Web.Site")
				};
				var host = new TestApplicationHost(config, profiler);
				host.StartApplication(false);

				var localizer = new NullLocalizer();
				var dbContext = new SqlDbContext(profiler, host, localizer);
				var messaging = new NullMessaging();
				var workflowEngine = new WorkflowEngine(config, host, dbContext, messaging);
				var renderer = new XamlRenderer(profiler, host);
				var scripter = new VueDataScripter(config, host, localizer);

				service.RegisterService<IDbContext>(dbContext);
				service.RegisterService<IWorkflowEngine>(workflowEngine);
				service.RegisterService<IApplicationHost>(host);
				service.RegisterService<IApplicationConfig>(config);
				service.RegisterService<IProfiler>(profiler);
				service.RegisterService<IRenderer>(renderer);
				service.RegisterService<ILocalizer>(localizer);
				service.RegisterService<IDataScripter>(scripter);
				service.RegisterService<IMessaging>(messaging);
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

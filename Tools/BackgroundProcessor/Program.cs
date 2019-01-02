
using System;
using System.Configuration;
using System.Globalization;
using System.Threading;

using A2v10.BackgroundTasks;
using A2v10.Data;
using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using A2v10.Workflow;

namespace BackgroundProcessor
{
	public class Program
	{
		static void Main(String[] args)
		{
			BackgroundTasksManager _manager = null;
			try
			{
				var defaultCulture = ConfigurationManager.AppSettings["defaultCulture"];
				if (defaultCulture != null)
				{
					var cultureInfo = new CultureInfo(defaultCulture);
					CultureInfo.DefaultThreadCurrentCulture = cultureInfo;
					CultureInfo.DefaultThreadCurrentUICulture = cultureInfo;
				}

				StartServices();
				var loc = ServiceLocator.Current;
				ILogger logger = loc.GetService<ILogger>();
				IDbContext dbContext = loc.GetService<IDbContext>();
				IApplicationHost host = loc.GetService<IApplicationHost>();
				Console.WriteLine("Service started");
				_manager = new BackgroundTasksManager(host, dbContext, logger);
				logger.LogBackground($"CurrentCulutre: {Thread.CurrentThread.CurrentCulture}");
				_manager.Start();
				_manager.StartTasksFromConfig();
				Console.WriteLine("Press any key to stop service...");
				Console.Read();
				_manager.Stop();
			}
			catch (Exception ex)
			{
				if (ex.InnerException != null)
					ex = ex.InnerException;
				Console.WriteLine(ex.Message);
				_manager?.Stop();
			}
		}

		private static IServiceLocator _currentService;

		static void StartServices()
		{
			ServiceLocator.Start = (IServiceLocator loc) =>
			{
				var profiler = new NullProfiler();
				var localizer = new NullLocalizer();
				var host = new BackgroundApplicationHost(profiler);
				var dbContext = new SqlDbContext(profiler, host, localizer);
				var logger = new BackgroundLogger(dbContext);
				var workflow = new WorkflowEngine(host, dbContext);

				loc.RegisterService<IProfiler>(profiler);
				loc.RegisterService<ILocalizer>(localizer);
				loc.RegisterService<IDbContext>(dbContext);
				loc.RegisterService<ILogger>(logger);
				loc.RegisterService<IApplicationHost>(host);
				loc.RegisterService<IWorkflowEngine>(workflow);
			};

			ServiceLocator.GetCurrentLocator = () =>
			{
				if (_currentService == null)
					_currentService = new ServiceLocator();
				return _currentService;
			};
		}
	}
}

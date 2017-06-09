
[assembly: WebActivatorEx.PreApplicationStartMethod(typeof(A2v10.Web.Mvc.Start.NinjectWebCommon), "Start")]
[assembly: WebActivatorEx.ApplicationShutdownMethodAttribute(typeof(A2v10.Web.Mvc.Start.NinjectWebCommon), "Stop")]

namespace A2v10.Web.Mvc.Start
{
	using System;
	using System.Web;
	using System.Web.Mvc;

	using Microsoft.Web.Infrastructure.DynamicModuleHelper;

	using Ninject;
	using Ninject.Web.Common;
	using Ninject.Web.Mvc;

	using A2v10.Data;
	using A2v10.Infrastructure;
	using A2v10.Web.Mvc.Configuration;

	public static class NinjectWebCommon
	{
		private static readonly Bootstrapper bootstrapper = new Bootstrapper();

		/// <summary>
		/// Starts the application
		/// </summary>
		public static void Start()
		{
			DynamicModuleUtility.RegisterModule(typeof(OnePerRequestHttpModule));
			DynamicModuleUtility.RegisterModule(typeof(NinjectHttpModule));
			bootstrapper.Initialize(CreateKernel);
		}


		public static IKernel Kernel
		{
			get
			{
				return bootstrapper.Kernel;
			}
		}

		/// <summary>
		/// Stops the application.
		/// </summary>
		public static void Stop()
		{
			bootstrapper.ShutDown();
		}

		/// <summary>
		/// Creates the kernel that will manage your application.
		/// </summary>
		/// <returns>The created kernel.</returns>
		private static IKernel CreateKernel()
		{
			var kernel = new StandardKernel();
			try
			{
				kernel.Bind<Func<IKernel>>().ToMethod(ctx => () => new Bootstrapper().Kernel);
				kernel.Bind<IHttpModule>().To<HttpApplicationInitializationHttpModule>();

				RegisterServices(kernel);
				return kernel;
			}
			catch
			{
				kernel.Dispose();
				throw;
			}
		}

		/// <summary>
		/// Load your modules or register your services here!
		/// </summary>
		/// <param name="kernel">The kernel.</param>
		private static void RegisterServices(IKernel kernel)
		{
			kernel.Bind<IDbContext>().To<SqlDbContext>().InSingletonScope();
			kernel.Bind<IConfiguration>().To<WebConfiguration>().InSingletonScope();
			kernel.Bind<IProfiler>().To<WebProfiler>().InSingletonScope();

			/* for ServiceLocator */
			DependencyResolver.SetResolver(new NinjectDependencyResolver(kernel));
		}
	}
}

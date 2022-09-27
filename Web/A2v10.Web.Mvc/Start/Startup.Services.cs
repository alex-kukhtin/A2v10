// Copyright © 2015-2022 Alex Kukhtin. All rights reserved.

using System;
using System.Web;

using Owin;

using Microsoft.Owin.Security.DataProtection;

using A2v10.Data;
using A2v10.Data.Interfaces;
using A2v10.Infrastructure;

using A2v10.Data.Providers;
using A2v10.Messaging;
using A2v10.Request;
using A2v10.Web.Config;
using A2v10.Web.Identity;
using A2v10.Workflow;
using A2v10.Xaml;
using A2v10.Web.Base;
using A2v10.Javascript;
using A2v10.Web.Mvc.Interfaces;

namespace A2v10.Web.Mvc.Start
{
	public static partial class Startup
	{
        private static IServiceLocator _currentLocator;

		private static IHooksProvider _hooksProvider = new HooksProvider();

		private static ILicenseManager _licenseManager;

		private static void StartLicenseManager()
		{
			var entry = EntryAssemblyAttribute.GetEntryAssembly();
			if (entry == null)
				return;
			var startupType = entry.GetType("A2v10.Application.AppStartup");
			if (startupType == null)
				return;
			var mtd = startupType.GetMethod("CreateLicenseManager");
			if (mtd == null)
				return;
			var mgr = mtd.Invoke(null, null);
			if (mgr is ILicenseManager licMgr)
				_licenseManager = licMgr;
		}

		public static void StartServices(IAppBuilder app)
		{
			// StartLicenseManager();
			// DI ready
			ServiceLocator.Start = (IServiceLocator locator) =>
			{
				IProfiler profiler = new WebProfiler();
				IUserLocale userLocale = new WebUserLocale();
				IApplicationHost host = new WebApplicationHost(profiler, userLocale, locator);
				ILocalizer localizer = new WebLocalizer(host, userLocale);
				ITokenProvider tokenProvider = new WebTokenProvider();
				IDbContext dbContext = new SqlDbContext(
					profiler as IDataProfiler,
					host as IDataConfiguration,
					localizer as IDataLocalizer,
					host as ITenantManager,
					tokenProvider);
				ILogger logger = new WebLogger(host, dbContext);
				IMessageService emailService = new IdentityEmailService(logger, host);
                ISmsService smsService = new SmsService(dbContext, logger);
				IRenderer renderer = new XamlRenderer(profiler, host);
				IDataScripter scripter = new VueDataScripter(host, localizer);
				IExternalLoginManager externalLoginManager = new ExternalLoginManager(dbContext);
				IUserStateManager userStateManager = new WebUserStateManager(host, dbContext);
                IMessaging messaging = new MessageProcessor(host, dbContext, emailService, smsService, logger);
                IWorkflowEngine workflowEngine = new WorkflowEngine(host, dbContext, messaging);
                IExternalDataProvider dataProvider = new ExternalDataContext();
				IHttpService httpService = new HttpService();
				IJavaScriptEngine javaScriptEngine = new JavaScriptEngine(dbContext, host, smsService, locator);
				ICommandInvoker commandInvoker = new CommandInvoker(locator);

				locator.RegisterService<IDbContext>(dbContext);
				locator.RegisterService<IProfiler>(profiler);
				locator.RegisterService<IApplicationHost>(host);
				locator.RegisterService<IRenderer>(renderer);
				locator.RegisterService<IWorkflowEngine>(workflowEngine);
				locator.RegisterService<IMessaging>(messaging);
				locator.RegisterService<IUserLocale>(userLocale);
				locator.RegisterService<ILocalizer>(localizer);
				locator.RegisterService<IDataScripter>(scripter);
				locator.RegisterService<ILogger>(logger);
				locator.RegisterService<IMessageService>(emailService);
				locator.RegisterService<ISmsService>(smsService);
				locator.RegisterService<IExternalLoginManager>(externalLoginManager);
				locator.RegisterService<IUserStateManager>(userStateManager);
				locator.RegisterService<IExternalDataProvider>(dataProvider);
				locator.RegisterService<IHttpService>(httpService);
				locator.RegisterService<IJavaScriptEngine>(javaScriptEngine);
				locator.RegisterService<ICommandInvoker>(commandInvoker);

				locator.RegisterService<ITokenProvider>(tokenProvider);
				locator.RegisterService<IHooksProvider>(_hooksProvider);

				IDataProtectionProvider dataProtection = app.GetDataProtectionProvider();
				locator.RegisterService<IDataProtectionProvider>(dataProtection);

				if (HttpContext.Current != null)
					HttpContext.Current.Items.Add("ServiceLocator", locator);
			};

            IServiceLocator GetOrCreateStatic()
            {
                if (_currentLocator == null)
                    _currentLocator = new ServiceLocator();
                return _currentLocator;
            }

			ServiceLocator.GetCurrentLocator = () =>
			{
				if (HttpContext.Current == null)
                {
                    return GetOrCreateStatic();
                }
				var currentContext = HttpContext.Current;
				var locator = currentContext.Items["ServiceLocator"];
                if (locator == null)
                {
                    var loc = new ServiceLocator(); // side effects
                    var fromHttp = HttpContext.Current.Items["ServiceLocator"] as IServiceLocator;
                    if (loc != fromHttp)
                        throw new InvalidOperationException("Invalid service locator");
                }
				return HttpContext.Current.Items["ServiceLocator"] as IServiceLocator;
			};
		}
	}
}

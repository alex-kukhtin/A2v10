// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

using System;
using System.Web;

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
using A2v10.Web.Script;
using A2v10.Web.Base;
using A2v10.Javascript;

namespace A2v10.Web.Mvc.Start
{
	public static partial class Startup
	{
        private static IServiceLocator _currentLocator;

		public static void StartServices()
		{
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
				IScriptProcessor scriptProcessor = new ScriptProcessor(scripter, host);
				IHttpService httpService = new HttpService();
				IJavaScriptEngine javaScriptEngine = new JavaScriptEngine(dbContext, host);

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
				locator.RegisterService<IScriptProcessor>(scriptProcessor);
				locator.RegisterService<IHttpService>(httpService);
				locator.RegisterService<IJavaScriptEngine>(javaScriptEngine);
				locator.RegisterService<ITokenProvider>(tokenProvider);

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

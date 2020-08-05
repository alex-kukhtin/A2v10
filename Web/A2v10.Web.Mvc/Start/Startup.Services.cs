// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

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
	public partial class Startup
	{
		public void StartServices()
		{
			// DI ready
			ServiceLocator.Start = (IServiceLocator locator) =>
			{
				IProfiler profiler = new WebProfiler();
				IApplicationHost host = new WebApplicationHost(profiler);
				ILocalizer localizer = new WebLocalizer(host);
				IDbContext dbContext = new SqlDbContext(
					profiler as IDataProfiler,
					host as IDataConfiguration,
					localizer as IDataLocalizer,
					host as ITenantManager);
				ILogger logger = new WebLogger(host, dbContext);
				IMessageService emailService = new IdentityEmailService(logger, host);
				IMessaging messaging = new MessageProcessor(host, dbContext, emailService, logger);
				IRenderer renderer = new XamlRenderer(profiler, host);
				IWorkflowEngine workflowEngine = new WorkflowEngine(host, dbContext, messaging);
				IDataScripter scripter = new VueDataScripter(host, localizer);
				ISmsService smsService = new SmsService(dbContext, logger);
				IExternalLoginManager externalLoginManager = new ExternalLoginManager(dbContext);
				IUserStateManager userStateManager = new WebUserStateManager(host, dbContext);
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

				HttpContext.Current.Items.Add("ServiceLocator", locator);
			};

			ServiceLocator.GetCurrentLocator = () =>
			{
				if (HttpContext.Current == null)
					throw new InvalidProgramException("There is no http context");
				var currentContext = HttpContext.Current;
				var locator = currentContext.Items["ServiceLocator"];
				if (locator == null)
					new ServiceLocator();
				return HttpContext.Current.Items["ServiceLocator"] as IServiceLocator;
			};
		}
	}
}

// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.


using System;
using System.IO;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Mvc;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using A2v10.Request;
using A2v10.Web.Mvc.Models;

namespace A2v10.Web.Mvc.Controllers
{
	[AllowAnonymous]
	public class AppLinkController : Controller
	{
		private readonly IApplicationHost _host;
		private readonly IDbContext _dbContext;
		private readonly ILocalizer _localizer;

		public AppLinkController()
		{
			// DI ready
			var serviceLocator = ServiceLocator.Current;
			_host = serviceLocator.GetService<IApplicationHost>();
			_dbContext = serviceLocator.GetService<IDbContext>();
			_localizer = serviceLocator.GetService<ILocalizer>();
		}

		public String CurrentLang => Thread.CurrentThread.CurrentUICulture.TwoLetterISOLanguageName;

		public async Task Default(String pathInfo)
		{
			var page = pathInfo.ToLowerInvariant();
			try
			{
				String path = _host.MakeFullPath(false, "_pages", $"{page}.{CurrentLang}.html");
				if (!System.IO.File.Exists(path))
					throw new IOException($"Application page not found ({page}.{CurrentLang}).");
				String pageContent = System.IO.File.ReadAllText(path);
				await SendPage(_localizer.Localize(null, pageContent));
			}
			catch (Exception ex)
			{
				Response.Write(ex.Message);
			}
		}

		async Task SendPage(String pageContent)
		{
			AppTitleModel appTitle = await _dbContext.LoadAsync<AppTitleModel>(_host.CatalogDataSource, "a2ui.[AppTitle.Load]");
			StringBuilder layout = new StringBuilder(_localizer.Localize(null, ResourceHelper.InitLayoutHtml));
			layout.Replace("$(Lang)", CurrentLang);
			layout.Replace("$(Build)", _host.AppBuild);

			layout.Replace("$(Partial)", pageContent);
			layout.Replace("$(Title)", appTitle.AppTitle);
			layout.Replace("$(Description)", _host.AppDescription);

			StringBuilder script = new StringBuilder(ResourceHelper.AppLinksScript);
			script.Replace("$(PageData)", $"{{ version: '{_host.AppVersion}', title: '{appTitle?.AppTitle}', subtitle: '{appTitle?.AppSubTitle}', multiTenant: false }}");
			script.Replace("$(Locale)", ResourceHelper.locale);
			script.Replace("$(AppLinks)", _localizer.Localize(null, ControllerHelpers.AppLinks(_host)));
			layout.Replace("$(PageScript)", script.ToString());

			Response.Write(layout.ToString());
		}
	}
}

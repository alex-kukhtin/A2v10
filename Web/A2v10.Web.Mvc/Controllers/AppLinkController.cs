// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.


using System;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Mvc;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using A2v10.Request;
using A2v10.Web.Base;
using A2v10.Web.Mvc.Models;

namespace A2v10.Web.Mvc.Controllers
{
	[AllowAnonymous]
	[CheckMobileFilter]
	public class AppLinkController : Controller
	{
		private readonly IApplicationHost _host;
		private readonly IDbContext _dbContext;
		private readonly ILocalizer _localizer;
		private readonly A2v10.Request.BaseController _baseController;

		public AppLinkController()
		{
			// DI ready
			var serviceLocator = ServiceLocator.Current;
			_host = serviceLocator.GetService<IApplicationHost>();
			_dbContext = serviceLocator.GetService<IDbContext>();
			_localizer = serviceLocator.GetService<ILocalizer>();
			_baseController = new A2v10.Request.BaseController();
			_host.StartApplication(false);
		}

		public String CurrentLang => Thread.CurrentThread.CurrentUICulture.TwoLetterISOLanguageName;


		public async Task Default(String pathInfo)
		{
			var page = pathInfo.ToLowerInvariant();
			try
			{
				if (pathInfo.ToLowerInvariant() == "appstyles")
				{
					AppStyles();
					return;
				}

				String pageContent = _host.ApplicationReader.ReadTextFile("_pages", $"{page}.{CurrentLang}.html");
				if (pageContent == null)
					throw new InvalidOperationException($"Application page not found ({page}.{CurrentLang}).");
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
			layout.Replace("$(AssetsStyleSheets)", _host.AppStyleSheetsLink("applink"));
			layout.Replace("$(LayoutHead)", _host.CustomAppHead());
			layout.Replace("$(LayoutScripts)", _host.CustomAppScripts());
			layout.Replace("$(HelpUrl)", _host.HelpUrl);
			layout.Replace("$(Partial)", pageContent);
			layout.Replace("$(Title)", appTitle.AppTitle);
			layout.Replace("$(Description)", _host.AppDescription);
			layout.Replace("$(SiteMeta)", Request.GetSiteMetaTags(_host));
			layout.Replace("$(LayoutManifest)", _host.CustomManifest());
			var theme = _host.Theme;
			layout.Replace("$(ColorScheme)", theme.ColorScheme);
			layout.Replace("$(Theme)", theme.FileName);

			StringBuilder script = new StringBuilder(ResourceHelper.AppLinksScript);
			script.Replace("$(PageData)", $"{{ version: '{_host.AppVersion}', title: '{appTitle?.AppTitle}', subtitle: '{appTitle?.AppSubTitle}', multiTenant: false, registation: false }}");
			script.Replace("$(Locale)", ResourceHelper.Locale);
			script.Replace("$(Utils)", ResourceHelper.PageUtils);
			script.Replace("$(AppLinks)", _localizer.Localize(null, _host.AppLinks()));
			layout.Replace("$(PageScript)", script.ToString());

			Response.Write(layout.ToString());
		}

		public void AppStyles()
		{
			Response.ContentType = "text/css";
			_baseController.GetAppStyleConent(Response.Output);
		}
	}
}

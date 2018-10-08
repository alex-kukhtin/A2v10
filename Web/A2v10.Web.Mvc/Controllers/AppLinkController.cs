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
		private readonly A2v10.Request.BaseController _baseController;

		public AppLinkController()
		{
			// DI ready
			var serviceLocator = ServiceLocator.Current;
			_host = serviceLocator.GetService<IApplicationHost>();
			_dbContext = serviceLocator.GetService<IDbContext>();
			_localizer = serviceLocator.GetService<ILocalizer>();
			_baseController = new A2v10.Request.BaseController();
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
			layout.Replace("$(AssetsStyleSheets)", AppStyleSheetsLink);

			layout.Replace("$(Partial)", pageContent);
			layout.Replace("$(Title)", appTitle.AppTitle);
			layout.Replace("$(Description)", _host.AppDescription);

			StringBuilder script = new StringBuilder(ResourceHelper.AppLinksScript);
			script.Replace("$(PageData)", $"{{ version: '{_host.AppVersion}', title: '{appTitle?.AppTitle}', subtitle: '{appTitle?.AppSubTitle}', multiTenant: false, registation: false }}");
			script.Replace("$(Locale)", ResourceHelper.locale);
			script.Replace("$(AppLinks)", _localizer.Localize(null, ControllerHelpers.AppLinks(_host)));
			layout.Replace("$(PageScript)", script.ToString());

			Response.Write(layout.ToString());
		}

		String AppStyleSheetsLink
		{
			get
			{
				// TODO _host AssestsDistionary
				var fp = _host.MakeFullPath(false, "_assets", "");
				if (!Directory.Exists(fp))
					return String.Empty;
				foreach (var f in Directory.EnumerateFiles(fp, "*.css"))
				{
					// at least one file
					return $"<link  href=\"/applink/appstyles\" rel=\"stylesheet\" />";
				}
				return String.Empty;
			}
		}

		public void AppStyles()
		{
			Response.ContentType = "text/css";
			_baseController.GetAppStyleConent(Response.Output);
		}
	}
}

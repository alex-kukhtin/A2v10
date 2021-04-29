// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.


using System;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using A2v10.Request;
using A2v10.Web.Base;
using A2v10.Web.Config;
using A2v10.Web.Identity;
using A2v10.Web.Mvc.Models;

namespace A2v10.Web.Mvc.Controllers
{
	[AllowAnonymous]
	[CheckMobileFilter]
	[ExecutingFilter]
	public class AppLinkController : Controller, IControllerLocale
	{
		private readonly IApplicationHost _host;
		private readonly IDbContext _dbContext;
		private readonly ILocalizer _localizer;
		private readonly IUserLocale _userLocale;
		private readonly A2v10.Request.BaseController _baseController;

		public AppLinkController()
		{
			// DI ready
			var serviceLocator = ServiceLocator.Current;
			_host = serviceLocator.GetService<IApplicationHost>();
			_dbContext = serviceLocator.GetService<IDbContext>();
			_localizer = serviceLocator.GetService<ILocalizer>();
			_userLocale = serviceLocator.GetService<IUserLocale>();
			_baseController = new A2v10.Request.BaseController();
			_host.StartApplication(false);
		}

		public String CurrentLang => _userLocale.Language;


		public async Task Default(String pathInfo)
		{
			var page = pathInfo.ToLowerInvariant();
			try
			{
				if (pathInfo.Equals("appstyles", StringComparison.InvariantCultureIgnoreCase))
				{
					AppStyles();
					return;
				}
				else if (pathInfo.Equals("about", StringComparison.InvariantCultureIgnoreCase))
				{
					await _baseController.RenderAbout(Response.Output);
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
			layout.Replace("$(LayoutScripts)", _host.CustomAppScripts());
			layout.Replace("$(Partial)", pageContent);
			layout.Replace("$(Title)", appTitle.AppTitle);
			layout.Replace("$(SiteMeta)", Request.GetSiteMetaTags(_host));
			_host.ReplaceMacros(layout);

			StringBuilder script = new StringBuilder(ResourceHelper.AppLinksScript);
			script.Replace("$(PageData)", $"{{ version: '{_host.AppVersion}', title: '{appTitle?.AppTitle}', subtitle: '{appTitle?.AppSubTitle}', multiTenant: false, registation: false }}");
			script.Replace("$(Locale)", ResourceHelper.LocaleLibrary(_userLocale.Language));
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

		#region IControllerLocale
		public void SetLocale()
		{
			if (User.Identity.IsAuthenticated)
			{
				_userLocale.Locale = User.Identity.GetUserLocale();
				return;
			}

			var rq = Request.QueryString["lang"];
			var loc = WebUserLocale.Lang2Locale(rq);
			if (loc != null)
			{
				Response.Cookies.Add(new HttpCookie("_locale", loc));
				_userLocale.Locale = loc;
				return;
			}

			var locale = Request.Cookies["_locale"];
			if (locale != null)
			{
				// CheckValue
				_userLocale.Locale = WebUserLocale.CheckLocale(locale.Value);
				return;
			}
		}
		#endregion

	}
}

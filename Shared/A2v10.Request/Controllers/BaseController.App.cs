// Copyright © 2015-2023 Oleksandr Kukhtin. All rights reserved.

using System.IO;
using System;
using System.Text;
using System.Threading.Tasks;
using System.Dynamic;

using Newtonsoft.Json;

using A2v10.Request.Properties;
using A2v10.Infrastructure;

namespace A2v10.Request;

public partial class BaseController
{
	public Task RenderAbout(TextWriter writer)
	{
		var aboutHtml = new StringBuilder(_localizer.Localize(null, Resources.about));
		var aboutScript = new StringBuilder(Resources.aboutScript);
		var pageGuid = $"el{Guid.NewGuid()}"; // starts with letter!
		aboutScript.Replace("$(PageGuid)", pageGuid);

		aboutScript.Replace("$(AppData)", GetAppData());

		aboutHtml.Replace("$(PageGuid)", pageGuid);
		aboutHtml.Replace("$(AboutScript)", aboutScript.ToString());

		writer.Write(aboutHtml.ToString());

		return Task.CompletedTask;
	}

	public String RenderAboutLink()
	{
		throw new NotImplementedException();
		/*
		var aboutHtml = new StringBuilder(_localizer.Localize(null, Resources.about));
		var appLinkScript = new StringBuilder(Resources.appLinkScript);
		var pageGuid = $"el{Guid.NewGuid()}"; // starts with letter!
		appLinkScript.Replace("$(PageGuid)", pageGuid);

		appLinkScript.Replace("$(AppData)", GetAppData());

		aboutHtml.Replace("$(PageGuid)", pageGuid);
		aboutHtml.Replace("$(AboutScript)", appLinkScript.ToString());

		return aboutHtml.ToString();
		*/
	}

	Task RenderAppPage(TextWriter writer, String page)
	{
		String appPageConetent = _host.ApplicationReader.ReadTextFile("_pages", $"{page}.{_userLocale.Language}.html");
		if (appPageConetent == null)
			throw new IOException($"Application page not found ({page}.{_userLocale.Language}).");
		var appPageHtml = new StringBuilder(_localizer.Localize(null, Resources.appPage));
		var appPageScript = new StringBuilder(Resources.appPageScript);
		var pageGuid = $"el{Guid.NewGuid()}"; // starts with letter!
		appPageScript.Replace("$(PageGuid)", pageGuid);
		appPageHtml.Replace("$(PageGuid)", pageGuid);
		appPageHtml.Replace("$(AppPageScript)", appPageScript.ToString());

		appPageHtml.Replace("$(AppPageContent)", appPageConetent);

		writer.Write(appPageHtml.ToString());
		return Task.CompletedTask;
	}

	String GetAppData()
	{
		return _host.GetAppData(_localizer, _userLocale);
	}

	async Task RenderChangePassword(TextWriter writer, ExpandoObject loadPrms)
	{
		try
		{
			var dm = await _dbContext.LoadModelAsync(_host.CatalogDataSource, $"{_host.ActualSecuritySchema}.[User.ChangePassword.Load]", loadPrms);
			var changeHtml = new StringBuilder(_localizer.Localize(null, Resources.changePassword));
			var changeScript = new StringBuilder();
			var pageGuid = $"el{Guid.NewGuid()}"; // starts with letter!
			changeScript.Replace("$(PageGuid)", pageGuid);

			changeHtml.Replace("$(PageGuid)", pageGuid);
			var scripter = new VueDataScripter(_host, _localizer);

			String dataModelText = "{}";
			if (dm != null)
				dataModelText = JsonConvert.SerializeObject(dm.Root, JsonHelpers.StandardSerializerSettings);

			changeHtml.Replace("$(Data)", dataModelText);
			changeHtml.Replace("$(PageScript)", dm.CreateScript(scripter));

			writer.Write(changeHtml.ToString());
		}
		catch (Exception ex)
		{

			String error = ex.Message;
			if (ex.Message.StartsWith("UI:"))
				error = _localizer.Localize(null, ex.Message.Substring(3));
			RenderErrorDialog(writer, error);
		}
	}
}

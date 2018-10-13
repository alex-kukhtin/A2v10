// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System.IO;
using System;
using System.Text;
using System.Threading.Tasks;
using System.Dynamic;
using Newtonsoft.Json;

using A2v10.Request.Properties;
using A2v10.Infrastructure;
using A2v10.Data.Interfaces;

namespace A2v10.Request
{
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

			return Task.FromResult(0);
		}

		Task RenderAppPage(TextWriter writer, String page)
		{
			String path = _host.MakeFullPath(Admin, "_pages", $"{page}.{CurrentLang}.html");
			if (!File.Exists(path))
				throw new IOException($"Application page not found ({page}.{CurrentLang}).");
			var appPageHtml = new StringBuilder(_localizer.Localize(null, Resources.appPage));
			var appPageScript = new StringBuilder(Resources.appPageScript);
			var pageGuid = $"el{Guid.NewGuid()}"; // starts with letter!
			appPageScript.Replace("$(PageGuid)", pageGuid);
			appPageHtml.Replace("$(PageGuid)", pageGuid);
			appPageHtml.Replace("$(AppPageScript)", appPageScript.ToString());

			String appPageConetent = File.ReadAllText(path);
			appPageHtml.Replace("$(AppPageContent)", appPageConetent);

			writer.Write(appPageHtml.ToString());
			return Task.FromResult(0);
		}

		String GetAppData()
		{
			var appPath = _host.MakeFullPath(Admin, "", "app.json");
			if (File.Exists(appPath))
			{
				String appText = File.ReadAllText(appPath);
				// validate
				Object app = JsonConvert.DeserializeObject<ExpandoObject>(appText);
				return _localizer.Localize(null, JsonConvert.SerializeObject(app));
			}
			ExpandoObject defAppData = new ExpandoObject();
			defAppData.Set("version", _host.AppVersion);
			defAppData.Set("title", "A2v10 Web Application");
			defAppData.Set("copyright", _host.Copyright);
			return JsonConvert.SerializeObject(defAppData);
		}

		async Task RenderChangePassword(TextWriter writer, ExpandoObject loadPrms)
		{
			try
			{
				var dm = await _dbContext.LoadModelAsync(_host.CatalogDataSource, "a2security.[User.ChangePassword.Load]", loadPrms);
				var changeHtml = new StringBuilder(_localizer.Localize(null, Resources.changePassword));
				var changeScript = new StringBuilder();
				var pageGuid = $"el{Guid.NewGuid()}"; // starts with letter!
				changeScript.Replace("$(PageGuid)", pageGuid);

				changeHtml.Replace("$(PageGuid)", pageGuid);
				var scripter = new VueDataScripter();

				String dataModelText = "{}";
				if (dm != null)
					dataModelText = JsonConvert.SerializeObject(dm.Root, StandardSerializerSettings);

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
}

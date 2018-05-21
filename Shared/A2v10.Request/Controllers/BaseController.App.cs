// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System.IO;
using System;
using System.Text;
using System.Threading.Tasks;
using System.Dynamic;
using Newtonsoft.Json;

using A2v10.Request.Properties;

namespace A2v10.Request
{
	public partial class BaseController
	{
		Task RenderAbout(TextWriter writer)
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

		String GetAppData()
		{
			var appPath = _host.MakeFullPath(Admin, "", "app.json");
			if (File.Exists(appPath))
			{
				String appText = File.ReadAllText(appPath);
				// validate
				Object app = JsonConvert.DeserializeObject<ExpandoObject>(appText);
				return JsonConvert.SerializeObject(app);
			}
			return "undefined";
		}

		async Task RenderChangePassword(TextWriter writer, ExpandoObject loadPrms)
		{
			var dm = await _dbContext.LoadModelAsync(_host.CatalogDataSource, "a2security.[User.ChangePassword.Load]", loadPrms);

			var changeHtml = new StringBuilder(_localizer.Localize(null, Resources.changePassword));
			var changeScript = new StringBuilder();
			var pageGuid = $"el{Guid.NewGuid()}"; // starts with letter!
			changeScript.Replace("$(PageGuid)", pageGuid);

			changeHtml.Replace("$(PageGuid)", pageGuid);
			var scripter = new VueDataScripter();

			var dataModelText = JsonConvert.SerializeObject(dm.Root, StandardSerializerSettings);

			changeHtml.Replace("$(Data)", dataModelText);
			changeHtml.Replace("$(PageScript)", dm.CreateScript(scripter));

			writer.Write(changeHtml.ToString());
		}
	}
}

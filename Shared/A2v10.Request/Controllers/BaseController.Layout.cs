// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.IO;
using System.Text;
using System.Collections.Generic;
using System.Dynamic;
using System.Threading.Tasks;

using Newtonsoft.Json;

using A2v10.Request.Properties;
using A2v10.Infrastructure;
using A2v10.Data.Interfaces;
using System.Text.RegularExpressions;
using A2v10.Request.Models;

namespace A2v10.Request
{
	public partial class BaseController
	{
		public void Layout(TextWriter writer, IDictionary<String, String> prms)
		{
			String layout = Admin ? Resources.layoutAdmin : Resources.layout;
			StringBuilder sb = new StringBuilder(_localizer.Localize(null, layout));
			foreach (var p in prms)
				sb.Replace(p.Key, p.Value);
			sb.Replace("$(AssetsStyleSheets)", AppStyleSheetsLink);
			sb.Replace("$(AssetsScripts)", AppScriptsLink);
			writer.Write(sb.ToString());
		}

		public async Task ShellScript(String dataSource, Action<ExpandoObject> setParams, Boolean userAdmin, Boolean bAdmin, TextWriter writer)
		{
			String shell = bAdmin ? Resources.shellAdmin : Resources.shell;

			ExpandoObject loadPrms = new ExpandoObject();
			setParams?.Invoke(loadPrms);

			String proc = bAdmin ? "a2admin.[Menu.Admin.Load]" : "a2ui.[Menu.User.Load]";
			IDataModel dm = await _dbContext.LoadModelAsync(dataSource, proc, loadPrms);

			String jsonMenu = JsonConvert.SerializeObject(dm.Root.RemoveEmptyArrays(), BaseController.StandardSerializerSettings);

			StringBuilder sb = new StringBuilder(shell);
			sb.Replace("$(Menu)", jsonMenu);
			sb.Replace("$(AppVersion)", _host.AppVersion);
			sb.Replace("$(Admin)", userAdmin ? "true" : "false");
			sb.Replace("$(Debug)", IsDebugConfiguration ? "true" : "false");
			sb.Replace("$(AppData)", GetAppData());
			writer.Write(sb.ToString());
		}

		String AppStyleSheetsLink
		{
			get
			{
				// TODO _host AssestsDistionary
				var fp = _host.MakeFullPath(Admin, "_assets", "");
				if (!Directory.Exists(fp))
					return String.Empty;
				foreach (var f in Directory.EnumerateFiles(fp, "*.css"))
				{
					// at least one file
					return $"<link  href=\"/shell/appstyles\" rel=\"stylesheet\" />";
				}
				return String.Empty;
			}
		}

		String AppScriptsLink
		{
			get
			{
				var fp = _host.MakeFullPath(Admin, "_assets", "");
				if (!Directory.Exists(fp))
					return String.Empty;
				foreach (var f in Directory.EnumerateFiles(fp, "*.js"))
				{
					// at least one file
					return $"<script type=\"text/javascript\" src=\"/shell/appscripts\"></script>";
				}
				return String.Empty;
			}
		}

		void GetAppFiles(String ext, TextWriter writer)
		{
			var fp = _host.MakeFullPath(Admin, "_assets", "");
			if (!Directory.Exists(fp))
				return;
			foreach (var f in Directory.EnumerateFiles(fp, $"*.{ext}"))
			{
				var fileName = f.ToLowerInvariant();
				if (!fileName.EndsWith($".min.{ext}"))
				{
					String minFile = fileName.Replace($".{ext}", $".min.{ext}");
					if (File.Exists(minFile))
						continue; // min.{ext} found
				}
				var txt = File.ReadAllText(fileName);
				writer.Write(txt);
			}
		}

		public void GetAppStyleConent(TextWriter writer)
		{
			GetAppFiles("css", writer);
		}

		public void GetAppScriptConent(TextWriter writer)
		{
			GetAppFiles("js", writer);
		}

		public async Task SaveFeedback(SaveFeedbackModel model)
		{
			await _dbContext.ExecuteAsync(_host.CatalogDataSource, "a2ui.SaveFeedback", model);
		}
	}
}

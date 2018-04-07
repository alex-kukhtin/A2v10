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
			writer.Write(sb.ToString());
		}

		public async Task ShellScript(String dataSource, Int32 tenantId, Int64 userId, Boolean userAdmin, Boolean bAdmin, TextWriter writer)
		{
			String shell = bAdmin ? Resources.shellAdmin : Resources.shell;

			ExpandoObject loadPrms = new ExpandoObject();
			loadPrms.Set("UserId", userId);
			if (_host.IsMultiTenant)
				loadPrms.Set("TenantId", tenantId);

			String proc = bAdmin ? "a2admin.[Menu.Admin.Load]" : "a2ui.[Menu.User.Load]";
			IDataModel dm = await _dbContext.LoadModelAsync(dataSource, proc, loadPrms);

			String jsonMenu = JsonConvert.SerializeObject(dm.Root.RemoveEmptyArrays(), BaseController.StandardSerializerSettings);

			StringBuilder sb = new StringBuilder(shell);
			sb.Replace("$(Menu)", jsonMenu);
			sb.Replace("$(AppVersion)", _host.AppVersion);
			sb.Replace("$(Admin)", userAdmin ? "true" : "false");
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

		public String GetAppStyleConent()
		{
			var fp = _host.MakeFullPath(Admin, "_assets", "");
			if (!Directory.Exists(fp))
				return String.Empty;
			StringBuilder sb = new StringBuilder();
			foreach (var f in Directory.EnumerateFiles(fp, "*.css"))
			{
				var fileName = f.ToLowerInvariant();
				if (!fileName.EndsWith(".min.css")) {
					String minFile = fileName.Replace(".css", ".min.css");
					if (File.Exists(minFile))
						continue; // min.css found
				}
				var txt = File.ReadAllText(fileName);
				sb.AppendLine(txt);
			}
			return sb.ToString();
		}
	}
}

// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

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
using A2v10.Request.Models;

namespace A2v10.Request
{
	public partial class BaseController
	{
		public void Layout(TextWriter writer, IDictionary<String, String> prms)
		{
			String layout = Admin ? Resources.layoutAdmin : 
							_host.Mobile ? Resources.layoutMobile :  Resources.layout;
			StringBuilder sb = new StringBuilder(_localizer.Localize(null, layout));
			foreach (var p in prms)
				sb.Replace(p.Key, p.Value);
			sb.Replace("$(AssetsStyleSheets)", _host.AppStyleSheetsLink("shell"));
			sb.Replace("$(AssetsScripts)", AppScriptsLink);
			sb.Replace("$(LayoutHead)", _host.CustomAppHead());
			sb.Replace("$(LayoutScripts)", _host.CustomAppScripts());
			writer.Write(sb.ToString());
		}

		public async Task ShellScript(String dataSource, Action<ExpandoObject> setParams, IUserInfo userInfo, Boolean bAdmin, TextWriter writer)
		{
			String shell = bAdmin ? Resources.shellAdmin : Resources.shell;

			ExpandoObject loadPrms = new ExpandoObject();
			setParams?.Invoke(loadPrms);

			if (_host.IsMultiTenant)
			{
				if (!userInfo.IsTenantAdmin)
				{
					// the user is NOT a tenant admin
					var menuKeys = await _dbContext.LoadListAsync<TenantUserModel>(_host.TenantDataSource, "a2security_tenant.[Permission.LoadMenu]", loadPrms);
					if (menuKeys != null)
					{
						var visibleKeys = String.Join(";", menuKeys);
						loadPrms.Set("Keys", visibleKeys);
					}
				}
			}

			String proc = bAdmin ? "a2admin.[Menu.Admin.Load]" : "a2ui.[Menu.User.Load]";
			IDataModel dm = await _dbContext.LoadModelAsync(dataSource, proc, loadPrms);

			ExpandoObject menuRoot = dm.Root.RemoveEmptyArrays();

			SetUserStatePermission(dm);

			String jsonMenu = JsonConvert.SerializeObject(menuRoot, JsonHelpers.StandardSerializerSettings);

			StringBuilder sb = new StringBuilder(shell);
			sb.Replace("$(Menu)", jsonMenu)
			.Replace("$(AppVersion)", _host.AppVersion)
			.Replace("$(Admin)", userInfo.IsAdmin ? "true" : "false")
			.Replace("$(TenantAdmin)", userInfo.IsTenantAdmin ? "true" : "false")
			.Replace("$(Debug)", IsDebugConfiguration ? "true" : "false")
			.Replace("$(AppData)", GetAppData());

			writer.Write(sb.ToString());
		}

		void SetUserStatePermission(IDataModel model)
		{
			if (_userStateManager == null)
				return;
			_userStateManager.SetReadOnly(model.Eval<Boolean>("UserState.ReadOnly"));
		}

		String AppScriptsLink
		{
			get
			{
				var files = _host.ApplicationReader.EnumerateFiles("_assets", "*.js");
				if (files == null)
					return String.Empty;
				foreach (var f in files)
					// at least one file
					return $"<script type=\"text/javascript\" src=\"/shell/appscripts\"></script>";
				return String.Empty;
			}
		}

		void GetAppFiles(String ext, TextWriter writer)
		{
			var files = _host.ApplicationReader.EnumerateFiles("_assets", $"*.{ext}");
			if (files == null)
				return;
			foreach (var f in files)
			{
				var fileName = f.ToLowerInvariant();
				if (!fileName.EndsWith($".min.{ext}"))
				{
					String minFile = fileName.Replace($".{ext}", $".min.{ext}");
					if (_host.ApplicationReader.FileExists(minFile))
						continue; // min.{ext} found
				}
				var txt = _host.ApplicationReader.FileReadAllText(fileName);
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

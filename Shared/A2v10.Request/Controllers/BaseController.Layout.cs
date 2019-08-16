﻿// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

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
							_host.Mobile ? Resources.layoutMobile : Resources.layout;
			StringBuilder sb = new StringBuilder(_localizer.Localize(null, layout));
			foreach (var p in prms)
				sb.Replace(p.Key, p.Value);
			sb.Replace("$(AssetsStyleSheets)", _host.AppStyleSheetsLink("shell"));
			sb.Replace("$(AssetsScripts)", AppScriptsLink);
			sb.Replace("$(LayoutHead)", _host.CustomAppHead());
			sb.Replace("$(LayoutScripts)", _host.CustomAppScripts());
			writer.Write(sb.ToString());
		}

		async Task<String> ProcessMultiTenantParams(ExpandoObject prms)
		{
			var permssionModel = await _dbContext.LoadModelAsync(_host.TenantDataSource, "a2security_tenant.[Permission.LoadMenu]", prms);
			if (permssionModel == null)
				return null;
			var root = permssionModel.Root;
			if (root == null)
				return null;

			// current company id
			Int64 currentCompanyId = root.Eval<Int64>("CurrentCompany.Id");
			if (currentCompanyId != 0)
				_userStateManager.SetUserCompanyId(currentCompanyId);

			// get keys and features
			StringBuilder strKeys = new StringBuilder();
			StringBuilder strFeatures = new StringBuilder();
			var modules = root.Eval<List<ExpandoObject>>("Modules");
			var features = root.Eval<List<ExpandoObject>>("Features");
			if (modules != null)
			{
				modules.ForEach(m =>
				{
					var key = m.Eval<String>("Module");
					if (key != null)
						strKeys.Append(key).Append(',');
				});
			}
			if (features != null)
			{
				features.ForEach(f =>
				{
					var feature = f.Eval<String>("Feature");
					if (feature != null)
						strFeatures.Append(feature).Append(",");
				});
				if (strKeys.Length > 0)
					prms.Set("Keys", strKeys.RemoveTailComma().ToString());
				if (strFeatures.Length > 0)
					prms.Set("Features", strFeatures.RemoveTailComma().ToString());
				else
					prms.Set("Features", "____"); // all features disabled
			}

			// avaliable companies
			var companies = root.Eval<List<ExpandoObject>>("Companies");
			if (companies != null)
				return JsonConvert.SerializeObject(companies, JsonHelpers.StandardSerializerSettings);
			return null;
		}

		public async Task ShellScript(String dataSource, Action<ExpandoObject> setParams, IUserInfo userInfo, Boolean bAdmin, TextWriter writer)
		{
			String shell = bAdmin ? Resources.shellAdmin : Resources.shell;

			ExpandoObject loadPrms = new ExpandoObject();
			setParams?.Invoke(loadPrms);

			String jsonCompanies = null;

			if (_host.IsMultiTenant)
			{
				// for all users (include features)
				jsonCompanies = await ProcessMultiTenantParams(loadPrms);
			}

			if (_host.Mobile)
				loadPrms.Set("Mobile", true);


			String proc = bAdmin ? "a2admin.[Menu.Admin.Load]" : "a2ui.[Menu.User.Load]";
			IDataModel dm = await _dbContext.LoadModelAsync(dataSource, proc, loadPrms);

			ExpandoObject menuRoot = dm.Root.RemoveEmptyArrays();

			SetUserStatePermission(dm);

			String jsonMenu = JsonConvert.SerializeObject(menuRoot, JsonHelpers.StandardSerializerSettings);

			StringBuilder sb = new StringBuilder(shell);
			sb.Replace("$(Menu)", jsonMenu)
			.Replace("$(Companies)", jsonCompanies ?? "null")
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

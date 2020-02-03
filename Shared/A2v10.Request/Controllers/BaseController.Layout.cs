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
	public class MultiTenantParamJson
	{
		public String Companies { get; set; }
		public String Period { get; set; }

	}

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
			sb.Replace("$(Release)", _host.IsDebugConfiguration ? "debug" : "release");
			writer.Write(sb.ToString());
		}

		async Task<MultiTenantParamJson> ProcessMultiTenantParams(ExpandoObject prms)
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
				if (strKeys.Length > 0)
					prms.Set("Keys", strKeys.RemoveTailComma().ToString());
				else
					prms.Set("Keys", "none"); // disable all
			}
			if (features != null)
			{
				features.ForEach(f =>
				{
					var feature = f.Eval<String>("Feature");
					if (feature != null)
						strFeatures.Append(feature).Append(",");
				});
				if (strFeatures.Length > 0)
					prms.Set("Features", strFeatures.RemoveTailComma().ToString());
				else
					prms.Set("Features", "____"); // all features disabled
			}

			// avaliable companies & xtra links
			var companies = root.Eval<List<ExpandoObject>>("Companies");
			var links = root.Eval<List<ExpandoObject>>("CompaniesLinks");
			var period = root.Eval<Object>("Period");
			if (companies != null || period != null)
			{
				String jsonCompanies = JsonConvert.SerializeObject(new { menu = companies, links },
					JsonHelpers.StandardSerializerSettings);
				String jsonPeriod = JsonConvert.SerializeObject(period, JsonHelpers.StandardSerializerSettings);
				return new MultiTenantParamJson()
				{
					Companies = jsonCompanies,
					Period = jsonPeriod
				};
			}
			return null;
		}

		public async Task ShellScript(String dataSource, Action<ExpandoObject> setParams, IUserInfo userInfo, Boolean bAdmin, TextWriter writer)
		{
			String shell = bAdmin ? Resources.shellAdmin : Resources.shell;

			ExpandoObject loadPrms = new ExpandoObject();
			setParams?.Invoke(loadPrms);

			var macros = new ExpandoObject();
			Boolean isUserIsAdmin = userInfo.IsAdmin && _host.IsAdminAppPresent;
			macros.Append(new Dictionary<String, Object>
			{
				{ "AppVersion", _host.AppVersion },
				{ "Admin", isUserIsAdmin ? "true" : "false" },
				{ "TenantAdmin", userInfo.IsTenantAdmin ? "true" : "false" },
				{ "Debug", IsDebugConfiguration ? "true" : "false" },
				{ "AppData", GetAppData() },
				{ "Companies", "null" },
				{ "Period", "null" },
			});

			if (_host.IsMultiTenant || _host.IsUsePeriodAndCompanies)
			{
				// for all users (include features)
				var res = await ProcessMultiTenantParams(loadPrms);
				if (res != null)
				{
					if (res.Companies != null)
						macros.Set("Companies", res.Companies);
					if (res.Period != null)
						macros.Set("Period", res.Period);
				}
			}

			if (_host.Mobile)
				loadPrms.Set("Mobile", true);


			String proc = bAdmin ? "a2admin.[Menu.Admin.Load]" : "a2ui.[Menu.User.Load]";
			IDataModel dm = await _dbContext.LoadModelAsync(dataSource, proc, loadPrms);

			ExpandoObject menuRoot = dm.Root.RemoveEmptyArrays();
			SetUserStatePermission(dm);

			String jsonMenu = JsonConvert.SerializeObject(menuRoot, JsonHelpers.StandardSerializerSettings);
			macros.Set("Menu", jsonMenu);

			writer.Write(shell.ResolveMacros(macros));
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

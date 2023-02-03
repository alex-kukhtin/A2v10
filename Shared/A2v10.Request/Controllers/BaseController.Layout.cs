﻿// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

using System;
using System.IO;
using System.Text;
using System.Collections.Generic;
using System.Dynamic;
using System.Threading.Tasks;
using System.Linq;

using Newtonsoft.Json;

using A2v10.Request.Properties;
using A2v10.Infrastructure;
using A2v10.Data.Interfaces;
using A2v10.Request.Models;

namespace A2v10.Request;

public class MultiTenantParamJson
{
	public String Companies { get; set; }
	public String Period { get; set; }
}

public record CheckLicenseResult
{
	public LicenseInfo LicenseInfo { get; set; }
	public Boolean NotFound => LicenseInfo == null;
	public Boolean ReadOnly => LicenseInfo == null || !LicenseInfo.Ok;
}

public partial class BaseController
{
	private String SETLICENSE_MENU => $@"[{{'Id': 1, 'Menu': [
{{'Id':90, 'Name':'{_localizer.Localize(null, "@[Profile]")}', 'Icon': 'user', 'Url':'profile', 'Menu': [
{{'Id':91,'Name':'{_localizer.Localize(null, "@[License]")}', 'Icon': 'policy', 'Url': 'license'}}]}}]
}}]";
	public void Layout(TextWriter writer, IDictionary<String, String> prms, String localUrl, String siteHost)
	{
		var customLayout = _host.CustomLayout;
		String layout;
		if (!String.IsNullOrEmpty(customLayout))
		{
			var layoutFile = customLayout.Replace("$(lang)", _userLocale.Language) + ".html";
			layout = _host.ApplicationReader.ReadTextFile("_layout", layoutFile);
			if (layout == null)
				throw new RequestModelException($"File not found. [{_host.AppKey}/_layout/{customLayout}.html]");
		}
		else
			layout = Admin ? Resources.layoutAdmin :
				_host.Mobile ? Resources.layoutMobile : Resources.layout;

		StringBuilder sb = new(_localizer.Localize(null, layout));

		foreach (var p in prms)
			sb.Replace(p.Key, p.Value);

		var actionUrl = localUrl.RemoveHeadSlash();
		if (_host.IsAdminMode)
			actionUrl = actionUrl.Remove(0, 6); // remove 'admin/';
		var action = RequestModel.GetActionFromUrl(_host, actionUrl);

		sb.Replace("$(AssetsScripts)", AppScriptsLink);
		sb.Replace("$(LayoutScripts)", _host.CustomAppScripts());
		sb.Replace("$(Release)", _host.IsDebugConfiguration ? "debug" : "release");
		sb.Replace("$(ModelScripts)", action?.GetModelScripts());
		sb.Replace("$(ModelStyles)", action?.GetModelStyles());
		sb.Replace("$(SiteMeta)", _host.GetSiteMetaTags(siteHost));
		_host.ReplaceMacros(sb);
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
		StringBuilder strKeys = new();
		StringBuilder strFeatures = new();
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
				JsonHelpers.ConfigSerializerSettings(_host.IsDebugConfiguration));
			String jsonPeriod = JsonConvert.SerializeObject(period, JsonHelpers.ConfigSerializerSettings(_host.IsDebugConfiguration));
			return new MultiTenantParamJson()
			{
				Companies = jsonCompanies,
				Period = jsonPeriod
			};
		}
		return null;
	}

	public async Task ShellScript2(Action<ExpandoObject> setParams, IUserInfo userInfo, TextWriter writer)
	{

		ExpandoObject loadPrms = new();
		setParams?.Invoke(loadPrms);

		var macros = new ExpandoObject();
		Boolean isUserIsAdmin = userInfo.IsAdmin && _host.IsAdminAppPresent;

		macros.Append(new Dictionary<String, Object>
		{
			{ "AppVersion", _host.AppVersion },
			{ "Admin", isUserIsAdmin ? "true" : "false" },
			{ "TenantAdmin", userInfo.IsTenantAdmin ? "true" : "false" },
			{ "ExternalUser", userInfo.IsExternalUser ? "true": "false" },
			{ "Debug", IsDebugConfiguration ? "true" : "false" },
			{ "AppData", GetAppData() },
			{ "Companies", "null" },
			{ "Period", "null" },
		});

		if (_host.Mobile)
			loadPrms.Set("Mobile", true);

		// ALWAYS from CATALOG
		IDataModel stateModel = await _dbContext.LoadModelAsync(_host.CatalogDataSource, $"{_host.ActualSecuritySchema}.[UserStateInfo.Load]", loadPrms);
		IDataModel dm = await _dbContext.LoadModelAsync(_host.TenantDataSource, _host.CustomUserMenu, loadPrms);

		var licData = SetLicenseFromData(stateModel);
		SetUserStateFromData(stateModel, licData.ReadOnly);

		// and SetUserState to MENU
		var us = stateModel.Root.Get<ExpandoObject>("UserState");
		if (licData.NotFound)
		{
			us.Set("NotifyLicense", _localizer.Localize(null, "@[License.NotFound]"));
			dm.Root.Set("Menu", JsonConvert.DeserializeObject<List<ExpandoObject>>(SETLICENSE_MENU.Replace('\'', '"')));
		}
		dm.Root.Set("UserState", us);

		ExpandoObject menuRoot = dm.Root.RemoveEmptyArrays();

		var companies = menuRoot.Eval<List<ExpandoObject>>("Companies");
		var links = menuRoot.Eval<List<ExpandoObject>>("CompaniesLinks");
		var period = menuRoot.Eval<Object>("Period");
		if (companies != null)
		{
			String jsonCompanies = JsonConvert.SerializeObject(new { menu = companies, links },
				JsonHelpers.ConfigSerializerSettings(_host.IsDebugConfiguration));
			var currComp = companies?.Find(c => c.Get<Boolean>("Current"));
			if (currComp == null)
				throw new InvalidDataException("There is no current company");
			_userStateManager.SetUserCompanyId(currComp.Get<Int64>("Id"));
			macros.Set("Companies", jsonCompanies);
		}
		if (period != null) {
			String jsonPeriod = JsonConvert.SerializeObject(period, JsonHelpers.ConfigSerializerSettings(_host.IsDebugConfiguration));
			macros.Set("Period", jsonPeriod);
		}
		var perm = menuRoot.Eval<List<ExpandoObject>>("Permissions");
		SetUserStatePermission(perm, userInfo.IsAdmin);

		menuRoot.RemoveKeys("Companies,CompaniesLinks,Period");
		String jsonMenu = JsonConvert.SerializeObject(menuRoot, JsonHelpers.ConfigSerializerSettings(_host.IsDebugConfiguration));
		macros.Set("Menu", jsonMenu);

		writer.Write(Resources.shell.ResolveMacros(macros));
	}

	public async Task ShellScript(String dataSource, Action<ExpandoObject> setParams, IUserInfo userInfo, Boolean bAdmin, TextWriter writer)
	{
		if (!String.IsNullOrEmpty(_host.CustomLayout)) {
			var customScript = await _host.ApplicationReader.ReadTextFileAsync("_layout", $"{_host.CustomLayout}.js");
			if (customScript == null)
				throw new RequestModelException($"File not found. [{_host.AppKey}/_layout/{_host.CustomLayout}.js]");
			await writer.WriteAsync(customScript);
		}

		if (!bAdmin && _host.CustomUserMenu != null)
		{
			await ShellScript2(setParams, userInfo, writer);
			return;
		}
		String shell = bAdmin ? Resources.shellAdmin : Resources.shell;

		ExpandoObject loadPrms = new();
		setParams?.Invoke(loadPrms);

		var macros = new ExpandoObject();
		Boolean isUserIsAdmin = userInfo.IsAdmin && _host.IsAdminAppPresent;
		macros.Append(new Dictionary<String, Object>
		{
			{ "AppVersion", _host.AppVersion },
			{ "Admin", isUserIsAdmin ? "true" : "false" },
			{ "TenantAdmin", userInfo.IsTenantAdmin ? "true" : "false" },
			{ "ExternalUser", userInfo.IsExternalUser ? "true": "false" },
			{ "Debug", IsDebugConfiguration ? "true" : "false" },
			{ "AppData", GetAppData() },
			{ "Companies", "null" },
			{ "Period", "null" },
		});

		Boolean setCompany = false;
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
		else if (_host.IsMultiCompany && !bAdmin)
		{
			setCompany = true;
		}

		if (_host.Mobile)
			loadPrms.Set("Mobile", true);

		if (_host.IsMultiTenant)
		{
			// TODO: Create Multi Tenant Load Menus....
		}
		String proc = bAdmin ? "a2admin.[Menu.Admin.Load]" : "a2ui.[Menu.User.Load]";
		IDataModel dm = await _dbContext.LoadModelAsync(dataSource, proc, loadPrms);

		ExpandoObject menuRoot = dm.Root.RemoveEmptyArrays();
		SetUserStateFromData(dm, false);

		String jsonMenu = JsonConvert.SerializeObject(menuRoot, JsonHelpers.ConfigSerializerSettings(_host.IsDebugConfiguration));
		macros.Set("Menu", jsonMenu);

		if (setCompany)
		{
			var comps = dm.Root.Get<List<ExpandoObject>>("Companies");
			var currComp = comps?.Find(c => c.Get<Boolean>("Current"));

			if (currComp == null)
			{
				throw new InvalidDataException("There is no current company");
			}

			var menuJson = JsonConvert.SerializeObject(comps, JsonHelpers.ConfigSerializerSettings(_host.IsDebugConfiguration));
			macros.Set("Companies", $"{{menu:{menuJson}, links:null}}");

			_userStateManager.SetUserCompanyId(currComp.Get<Int64>("Id"));

		}

		writer.Write(shell.ResolveMacros(macros));
	}

	void SetUserStateFromData(IDataModel model, Boolean readOnly)
	{
		if (_userStateManager == null)
			return;
		var ro = readOnly || model.Eval<Boolean>("UserState.ReadOnly");
		_userStateManager.SetReadOnly(ro);
	}

	CheckLicenseResult SetLicenseFromData(IDataModel userState)
	{
		var result = new CheckLicenseResult();
		if (_licenseManager == null)
			return result;
		var lic = userState.Eval<String>("UserState.License");
		if (String.IsNullOrEmpty(lic))
			return result;
		var licInfo = _licenseManager.VerifyLicense(lic);
		_userStateManager.SetLicense(licInfo);
		result.LicenseInfo = licInfo;
		return result;
	}

	void SetUserStatePermission(IList<ExpandoObject> list, bool isAdmin)
	{
		String perm = String.Empty;
		if (isAdmin)
			perm = "_admin_";
		else if (list != null && list.Count > 0)
			perm = ModulePermission.FromExpandoList(list);
		_userStateManager.SetUserPermissions(perm);
	}


	String AppScriptsLink
	{
		get
		{
			var files = _host.ApplicationReader.EnumerateFiles("_assets", "*.js");
			if (files == null)
				return String.Empty;
			// at least one file
			if (files.Any())
				return $"<script type=\"text/javascript\" src=\"/_shell/appscripts\"></script>";
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

	public void GetLayoutAppStyles(TextWriter writer)
	{
		if (String.IsNullOrEmpty(_host.CustomLayout))
			return;
		var stylesText = _host.ApplicationReader.ReadTextFile("_layout", $"{_host.CustomLayout}.css");
		if (stylesText == null)
			throw new RequestModelException($"File not found. [{_host.AppKey}/_layout/{_host.CustomLayout}.css]");
		writer.Write(stylesText);
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

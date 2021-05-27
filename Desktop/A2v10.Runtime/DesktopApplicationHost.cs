// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

using System;
using System.IO;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Reflection;
using System.Data.SqlClient;
using System.Text;
using System.Configuration;
using System.Dynamic;

using A2v10.Infrastructure;
using A2v10.Data.Interfaces;

namespace A2v10.Runtime
{

	//<add key = "appPath" value="c:/git/a2v10/apps" />
	//<add key = "appKey" value="develop" />

	public class DesktopApplicationHost : IApplicationHost, ITenantManager, IDataConfiguration, ISupportUserInfo
	{
		readonly IDictionary<String, String> _cnnStrings = new Dictionary<String, String>();
		private Boolean _admin;

		public DesktopApplicationHost(IProfiler profiler)
		{
			Profiler = profiler;
			Profiler.Enabled = IsDebugConfiguration;
		}

		public Boolean Embedded => true;
		public IProfiler Profiler { get; }
		public Boolean Mobile => false;
		public Boolean IsAdminMode => _admin;

		private static String CurrentAppPath { get; set; }
		private static String CurrentAppKey { get; set; }
		private static String CurrentAppConnectionString { get; set; }
		private static String CurrentHelpUrl { get; set; }

		private static String CurrentUserName { get; set; }
		private static String CurrentPersonName { get; set; }
		private static FullUserInfo CurrentUserInfo { get; set; }
		private static Dictionary<Int64, String> CurrentCompanyMap { get; set; }

		public String AppPath => CurrentAppPath;
		public String AppKey => CurrentAppKey;

		public FullUserInfo UserInfo => CurrentUserInfo;

		public String SmtpConfig => throw new NotImplementedException(nameof(SmtpConfig));
		public String CustomLayout => throw new NotImplementedException(nameof(CustomLayout));

		public String HostingPath
		{
			get
			{
				var path = Assembly.GetExecutingAssembly().Location;
				return Path.GetDirectoryName(path);
			}
		}

		public String AppDescription => "A2v10.Desktop";
		public String SupportEmail => null;
		public String AppHost => null;
		public String UserAppHost => null;
		public String ScriptEngine => null;

		public ITheme Theme => null;
		public String HelpUrl => CurrentHelpUrl;

		public Boolean IsProductionEnvironment => false;
		public Boolean IsDebugConfiguration => true;

		private static IApplicationReader _reader = null;


		public void SetAdmin(bool bAdmin)
		{
			_admin = bAdmin;
		}

		public void StartApplication(Boolean bAdmin)
		{
		}

		public IApplicationReader ApplicationReader
		{
			get
			{
				if (_reader == null)
					throw new InvalidProgramException("ApplicationReader is not configured");
				return _reader;
			}
		}

		public Boolean IsMultiTenant => false; // TODO:
		public Boolean IsMultiCompany => true;
		public Boolean IsUsePeriodAndCompanies => true;
		public String CustomUserMenu => null;

		public Boolean IsRegistrationEnabled => false;
		public Boolean IsDTCEnabled => false;
		public Boolean IsAdminAppPresent => false;
		public String UseClaims => null;
		public Int32? TenantId { get; set; } 
		public Int64? UserId { get; set; }
		public String UserSegment { get; set; }
		public String CatalogDataSource => "Catalog";
		public String TenantDataSource => null;
		public String CustomSecuritySchema => null;

		public String AppVersion => AppInfo.MainAssembly.Version;
		public String AppBuild => AppInfo.MainAssembly.Build;
		public String Copyright => AppInfo.MainAssembly.Copyright;


		public String ConnectionString(String source)
		{
			return CurrentAppConnectionString;
		}

		public static String ZipApplicationFileName(String appPath, String appKey)
		{
			var path = Path.Combine(appPath, appKey);
			path = Path.ChangeExtension(path, ".app");
			if (File.Exists(path))
			{
				return path;
			}
			return null;
		}

		public String MakeRelativePath(String path, String fileName)
		{
			throw new NotImplementedException("DesktopApplicationHost.MakeRelativePath");
		}

		#region ITenantManager

		public Task SetTenantIdAsync(SqlConnection cnn, String source)
		{
			return Task.CompletedTask;
		}

		public void SetTenantId(SqlConnection cnn, String source)
		{
		}
		#endregion

		internal static void StartApplication(String cnnString)
		{
			var appConfig = new AppConfiguration();
			appConfig.Load(cnnString);

			CurrentAppConnectionString = cnnString;
			CurrentAppPath = appConfig.AppPath;
			CurrentAppKey = appConfig.AppKey;
			CurrentHelpUrl = appConfig.HelpUrl;
			CurrentUserInfo = appConfig.UserInfo;
			CurrentCompanyMap = appConfig.CompanyMap;
			if (appConfig.UserInfo.UserId == 0)
			{
				throw new DesktopException(DesktopException.UserNotRegistered);
			}
			CreateReader();
		}

		static void CreateReader()
		{
			var file = ZipApplicationFileName(CurrentAppPath, CurrentAppKey);
			String key = CurrentAppKey;
			if (file != null)
				_reader = new ZipApplicationReader(CurrentAppPath, key);
			else
				_reader = new FileApplicationReader(CurrentAppPath, key)
				{
					EmulateBox = true
				};
		}

		internal static String GetCompanyCode()
		{
			var userStateManager = ServiceLocator.Current.GetService<IUserStateManager>();
			Int64 companyId = userStateManager.UserCompanyId(1, CurrentUserInfo.UserId);
			if (CurrentCompanyMap.ContainsKey(companyId))
				return CurrentCompanyMap[companyId];
			return String.Empty;
		}

		public static String GetVersions()
		{
			var v = new AppVersions(CurrentAppConnectionString, _reader);
			return v.GetCurrentVersions();
		}

		public String GetAppSettings(String source)
		{
			if (source == null)
				return null;
			if (source.IndexOf("@{AppSettings.") == -1)
				return source;
			Int32 xpos = 0;
			var sb = new StringBuilder();
			do
			{
				Int32 start = source.IndexOf("@{AppSettings.", xpos);
				if (start == -1) break;
				Int32 end = source.IndexOf("}", start + 14);
				if (end == -1) break;
				var key = source.Substring(start + 14, end - start - 14);
				var value = ConfigurationManager.AppSettings[key] ?? String.Empty; // GetLocalizedValue(locale, key);
				sb.Append(source.Substring(xpos, start - xpos));
				sb.Append(value);
				xpos = end + 1;
			} while (true);
			sb.Append(source.Substring(xpos));
			return sb.ToString();
		}

		public ExpandoObject GetEnvironmentObject(String key)
		{
			throw new NotImplementedException(nameof(GetEnvironmentObject));
		}

		public ExpandoObject GetAppSettingsObject(String key)
		{
			throw new NotImplementedException(nameof(GetEnvironmentObject));
		}

		public void CheckIsMobile(String host)
		{
		}

	}
}

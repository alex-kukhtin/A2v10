// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

using System;
using System.Configuration;
using System.Dynamic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;

namespace BackgroundProcessor
{
	public class BackgroundUserLocale : IUserLocale
	{
		public String Locale { get; set; }
		public String Language => Thread.CurrentThread.CurrentUICulture.TwoLetterISOLanguageName;
		public String Language2 => Thread.CurrentThread.CurrentUICulture.TwoLetterISOLanguageName;
	}

	public class BackgroundApplicationHost : IApplicationHost, IDataConfiguration
	{
		private readonly IProfiler _profiler;
        private readonly IServiceLocator _locator;

		public BackgroundApplicationHost(IProfiler profiler, IServiceLocator locator)
		{
			_profiler = profiler;
            _locator = locator;

        }

		#region IApplicationHost
		public IProfiler Profiler => _profiler;
        public IServiceLocator Locator => _locator;
		public Boolean Mobile => false;
		public Boolean IsAdminMode => false;
		public Boolean Embedded => false;

		public String AppPath => ConfigurationManager.AppSettings["appPath"];
		public String AppKey => ConfigurationManager.AppSettings["appKey"] ?? String.Empty;
		public String AppHost => ConfigurationManager.AppSettings["appHost"];
		public String UserAppHost => ConfigurationManager.AppSettings["userAppHost"];
		public String SmtpConfig => ConfigurationManager.AppSettings["mailSettings"];

		public String CustomLayout => throw new NotImplementedException(nameof(CustomLayout));
		public String AppDescription => throw new NotImplementedException(nameof(AppDescription));
		public String SupportEmail => throw new NotImplementedException(nameof(SupportEmail));

		public ITheme Theme => throw new NotImplementedException(nameof(Theme));
		public String HelpUrl => throw new NotImplementedException(nameof(HelpUrl));
		public String HostingPath => throw new NotImplementedException(nameof(HostingPath));
		public String CustomSecuritySchema => ConfigurationManager.AppSettings[AppHostKeys.customSecuritySchema];

		public Boolean IsDebugConfiguration
		{
			get
			{
				var debug = ConfigurationManager.AppSettings["configuration"];
				if (String.IsNullOrEmpty(debug))
					return true; // default is 'debug'
				return debug.ToLowerInvariant() == "debug";
			}
		}

		public Boolean IsProductionEnvironment => true;

		public String ScriptEngine => ConfigurationManager.AppSettings["scriptEngine"];

		public Boolean IsRegistrationEnabled => throw new NotSupportedException(nameof(IsRegistrationEnabled));
		public Boolean IsDTCEnabled =>  throw new NotSupportedException(nameof(IsDTCEnabled));
		public Boolean IsAdminAppPresent => throw new NotSupportedException(nameof(IsAdminAppPresent));
		public String UseClaims => throw new NotSupportedException(nameof(UseClaims));
		public Boolean IsMultiTenant => throw new NotSupportedException(nameof(IsMultiTenant));
		public Boolean IsUsePeriodAndCompanies => throw new NotSupportedException(nameof(IsUsePeriodAndCompanies));
		public Boolean IsMultiCompany => false;
		public String CustomUserMenu => null;
		public Int32? TenantId { get => throw new NotSupportedException(); set => throw new InvalidOperationException(nameof(TenantId)); }
		public Int64? UserId { get => throw new NotSupportedException(nameof(UserId)); set => throw new InvalidOperationException(nameof(UserId)); }
		public String UserSegment { get => throw new NotSupportedException(nameof(UserId)); set => throw new InvalidOperationException(nameof(UserId)); }
		public String CatalogDataSource => throw new NotSupportedException(nameof(CatalogDataSource));
		public String TenantDataSource => throw new NotSupportedException(nameof(TenantDataSource));
		public String AppVersion => throw new NotSupportedException(nameof(AppVersion));
		public String AppBuild => throw new NotSupportedException(nameof(AppBuild));
		public String Copyright => throw new NotSupportedException(nameof(Copyright));

		public String ConnectionString(String source)
		{
			if (String.IsNullOrEmpty(source))
				source = "Default";

			var strSet = ConfigurationManager.ConnectionStrings[source];
			if (strSet == null)
				throw new ConfigurationErrorsException($"Connection string '{source}' not found");
			return strSet.ConnectionString;
		}

		IApplicationReader _reader;

		public void SetAdmin(bool bAdmin)
		{

		}

		public void StartApplication(Boolean bAdminMode)
		{

			if (AppPath.StartsWith("db:"))
				_reader = new DbApplicationReader(AppPath);
			else
			{
				String key = bAdminMode ? "admin" : AppKey;
				_reader = new FileApplicationReader(AppPath, key);
			}
		}

		public IApplicationReader ApplicationReader => _reader;

		public String MakeFullPath(Boolean bAdmin, String path, String fileName)
		{
			String appKey = AppKey;
			if (fileName.StartsWith("/"))
			{
				path = String.Empty;
				fileName = fileName.Remove(0, 1);
			}
			if (appKey != null)
				appKey = "/" + appKey;
			String fullPath = Path.Combine($"{AppPath}{appKey}", path, fileName);
			return Path.GetFullPath(fullPath);
		}

		public String MakeRelativePath(String path, String fileName)
		{
			throw new NotImplementedException("BackgroundApplicationHost.MakeRelativePath");
		}

		public String ReadTextFile(Boolean bAdmin, String path, String fileName)
		{
			String fullPath = MakeFullPath(bAdmin, path, fileName);
			using (var tr = new StreamReader(fullPath))
			{
				return tr.ReadToEnd();
			}
		}

		public Task<String> ReadTextFileAsync(Boolean bAdmin, String path, String fileName)
		{
			throw new NotImplementedException("BackgroundApplicationHost.ReadTextFileAsync");
		}
		#endregion

		public String GetAppSettings(String source)
		{
			throw new NotImplementedException("BackgroundApplicationHost.GetAppSettings");
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

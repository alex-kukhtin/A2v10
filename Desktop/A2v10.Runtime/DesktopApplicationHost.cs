// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using System;
using System.IO;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Reflection;
using System.Data.SqlClient;

using A2v10.Infrastructure;
using A2v10.Data.Interfaces;
using A2v10.Request;
using System.Text;
using System.Configuration;

namespace A2v10.Runtime
{

	//<add key = "appPath" value="c:/git/a2v10/apps" />
	//<add key = "appKey" value="develop" />

	public class DesktopApplicationHost : IApplicationHost, ITenantManager, IDataConfiguration
	{
		readonly IProfiler _profiler;
		readonly IDictionary<String, String> _cnnStrings = new Dictionary<String, String>();

		public DesktopApplicationHost(IProfiler profiler)
		{
			_profiler = profiler;
			_profiler.Enabled = IsDebugConfiguration;
		}

		public IProfiler Profiler => _profiler;
		public Boolean Mobile { get; set; }

		private static String CurrentAppPath { get; set; }
		private static String CurrentAppKey { get; set; }
		private static String CurrentAppConnectionString { get; set; }

		public String AppPath => CurrentAppPath;
		public String AppKey => CurrentAppKey;

		public String SmtpConfig => throw new NotImplementedException(nameof(SmtpConfig));

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

		public String Theme => null;
		public String HelpUrl => "http://help";

		public Boolean IsDebugConfiguration
		{
			get
			{
				return true;
			}
		}

		IApplicationReader _reader = null;

		public void StartApplication(Boolean bAdmin)
		{
			var file = ZipApplicationFile;
			String key = bAdmin ? "admin" : AppKey;
			if (file != null)
				_reader = new ZipApplicationReader(AppPath, key);
			else
				_reader = new FileApplicationReader(AppPath, key);
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

		public Boolean IsMultiTenant => true; // TODO:
		public Boolean IsRegistrationEnabled => false;
		public String UseClaims => null;
		public Int32? TenantId { get; set; } 
		public String CatalogDataSource => "Catalog";
		public String TenantDataSource => null;

		public String AppVersion => AppInfo.MainAssembly.Version;
		public String AppBuild => AppInfo.MainAssembly.Build;
		public String Copyright => AppInfo.MainAssembly.Copyright;


		public String ConnectionString(String source)
		{
			return CurrentAppConnectionString;
		}

		public String ZipApplicationFile
		{
			get
			{
				var path = Path.Combine(AppPath, AppKey);
				path = Path.ChangeExtension(path, ".app");
				if (File.Exists(path))
				{
					return path;
				}
				return null;
			}
		}

		public String MakeRelativePath(String path, String fileName)
		{
			throw new NotImplementedException();
		}

		#region ITenantManager

		public Task SetTenantIdAsync(SqlConnection cnn, String source)
		{
			return Task.FromResult(0);
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
	}
}

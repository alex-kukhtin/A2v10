// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

using System;
using System.Configuration;
using System.Threading.Tasks;
using System.IO;
using System.Text;
using System.Dynamic;
using System.Data.SqlClient;
using System.Web.Hosting;

using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

using A2v10.Infrastructure;
using A2v10.Data.Interfaces;

using A2v10.Web.Base;
using System.Text.RegularExpressions;
using System.Threading;

namespace A2v10.Web.Config
{
	public class ThemeInfo : ITheme
	{
		public ThemeInfo(String text, String hostingPath)
		{
			Name = text ?? String.Empty;
			FileName = "site";
			String schemeName = null;
			if (Name.Contains("."))
			{
				var tx = Name.Split('.');
				Name = tx[0].Trim();
				schemeName = tx[1].Trim();
			}
			if (Name == "advance" && String.IsNullOrEmpty(schemeName))
				schemeName = "default";

			if (!String.IsNullOrEmpty(Name))
				FileName += $".{Name.ToLowerInvariant()}";

			if (!String.IsNullOrEmpty(schemeName))
			{
				var schemePath = Path.Combine(hostingPath, "css", $"{schemeName}.colorscheme.min.css");
				if (File.Exists(schemePath))
				{
					ColorScheme = $"<style>{File.ReadAllText(schemePath)}</style>";
				}
			}
		}
		public String Name { get; }
		public String FileName { get; }
		public String ColorScheme { get; }
	}

	public class WebApplicationHost : A2v10.Infrastructure.IApplicationHost, ITenantManager, IDataConfiguration
	{
		private readonly IProfiler _profiler;
		private readonly Boolean _emulateBox = false;
		private Boolean _admin;
		private readonly Boolean _debug;
		private readonly String _environment;

		public WebApplicationHost(IProfiler profiler)
		{
			_profiler = profiler;
			_emulateBox = IsAppSettingsIsTrue("emulateBox");

			var conf = ConfigurationManager.AppSettings["configuration"];
			_debug = String.IsNullOrEmpty(conf) || conf == "debug";

			// after _debug!
			_profiler.Enabled = _debug;

			_environment = ConfigurationManager.AppSettings["environment"];
		}

		public IProfiler Profiler => _profiler;

		public Boolean Mobile { get; private set; }
		public Boolean Embedded => false;
		public Boolean IsAdminMode => _admin;

		#region IDataConfiguration

		public String ConnectionString(String source)
		{
			if (String.IsNullOrEmpty(source))
				source = "Default";

			if (!String.IsNullOrEmpty(UserSegment) && source != CatalogDataSource)
				source = UserSegment;

			var strSet = ConfigurationManager.ConnectionStrings[source];
			if (strSet == null)
				throw new ConfigurationErrorsException($"Connection string '{source}' not found");
			var cnnString = strSet.ConnectionString;
			if (source != CatalogDataSource && cnnString.Contains("$(")) {
				cnnString = cnnString
					.Replace("$(UserId)", UserId.Value.ToString())
					.Replace("$(TenantId)", TenantId.Value.ToString());
				}
			return cnnString;
		}
		#endregion

		public String AppPath
		{
			get
			{
				String path = ConfigurationManager.AppSettings["appPath"];
				if (path == null)
					path = "~/App_application";
				if (path.StartsWith("~"))
					path = HostingEnvironment.MapPath(path);
				return path;
			}
		}

		public String ScriptEngine => ConfigurationManager.AppSettings["scriptEngine"];

		public String ZipApplicationFile
		{
			get
			{
				var path = Path.Combine(AppPath, AppKey ?? String.Empty);
				path = Path.ChangeExtension(path, ".app");
				if (File.Exists(path))
				{
					return path;
				}
				return null;
			}
		}

		public String AppKey
		{
			get
			{
				return ConfigurationManager.AppSettings["appKey"] ?? String.Empty;
			}
		}

		public String HelpUrl => ConfigurationManager.AppSettings["helpUrl"];
		public String AppDescription => ConfigurationManager.AppSettings["appDescription"];
		public String SupportEmail => ConfigurationManager.AppSettings["supportEmail"];
		public String AppHost => ConfigurationManager.AppSettings["appHost"];
		public String UserAppHost => ConfigurationManager.AppSettings["userAppHost"];
		public String SmtpConfig => ConfigurationManager.AppSettings["mailSettings"];

		public String HostingPath => HostingEnvironment.MapPath("~");

		public ITheme Theme => new ThemeInfo(ConfigurationManager.AppSettings["theme"], HostingPath);

		public Boolean IsAdminAppPresent {
			get
			{
				String dirName = Path.Combine(AppPath, "Admin").ToLowerInvariant();
				if (Directory.Exists(dirName))
					return true;
				String appFile = Path.Combine(AppPath, "admin.app");
				if (File.Exists(appFile))
					return true;
				return false;
			}
		}

		Boolean IsAppSettingsIsTrue(String name)
		{
			var mt = ConfigurationManager.AppSettings[name];
			if (String.IsNullOrEmpty(mt))
				return false;
			return mt.ToLowerInvariant() == "true";
		}

		public Boolean IsUsePeriodAndCompanies
		{
			get
			{
				return IsAppSettingsIsTrue("custom");
			}
		}

		public Boolean IsMultiTenant => IsAppSettingsIsTrue("multiTenant");
		public Boolean IsMultiCompany => !_admin && IsAppSettingsIsTrue("multiCompany");
		public Boolean IsRegistrationEnabled => IsAppSettingsIsTrue("registration");
		public Boolean IsDTCEnabled => IsAppSettingsIsTrue("enableDTC");
		public String CustomSecuritySchema => ConfigurationManager.AppSettings[AppHostKeys.customSecuritySchema];

		public String UseClaims => ConfigurationManager.AppSettings["useClaims"];

		Int32 _tenantId;

		public Int32? TenantId
		{
			get
			{
				if (!IsMultiTenant)
					return null;
				return _tenantId;
			}
			set
			{
				if (!IsMultiTenant)
					return;
				_tenantId = value.Value;
			}
		}

		public Int64? UserId { get; set; }
		public String UserSegment { get; set; }

		public String CatalogDataSource => IsMultiTenant ? "Catalog" : null;
		public String TenantDataSource => String.IsNullOrEmpty(UserSegment) ? null : UserSegment;

		public Boolean IsDebugConfiguration => _debug;
		public Boolean IsProductionEnvironment => _environment == "production";

		public String MakeRelativePath(String path, String fileName)
		{
			if (fileName.StartsWith("/"))
			{
				path = String.Empty;
				fileName = fileName.Remove(0, 1);
			}
			String appKey = AppConfig.AppKey();
			String appPath = AppConfig.AppPath();
			String fullPath = Path.Combine($"{appPath}{appKey}", path, fileName);
			return fullPath;
		}

		IApplicationReader _reader;

		public IApplicationReader ApplicationReader
		{
			get
			{
				if (_reader == null)
					throw new InvalidProgramException("ApplicationReader is not configured");
				return _reader;
			}
		}

		public void SetAdmin(bool bAdmin)
		{
			_admin = bAdmin;
		}

		public void StartApplication(Boolean bAdmin)
		{
			var file = ZipApplicationFile;
			String key = bAdmin ? "admin" : AppKey;
			if (file != null)
				_reader = new ZipApplicationReader(AppPath, key);
			else if (AppPath.StartsWith("db:"))
				throw new NotImplementedException("DbApplicationReader");
			else
				_reader = new FileApplicationReader(AppPath, key)
				{
					EmulateBox = _emulateBox
				};
		}

		public String AppVersion => AppInfo.MainAssembly.Version;
		public String AppBuild => AppInfo.MainAssembly.Build;
		public String Copyright => AppInfo.MainAssembly.Copyright;

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
			var val = ConfigurationManager.AppSettings[key];
			if (val == null)
				throw new ConfigurationErrorsException($"Configuration parameter 'appSettings/{key}' not defined");
			return JsonConvert.DeserializeObject<ExpandoObject>(val, new ExpandoObjectConverter());
		}


		private static Lazy<Regex> _checkMobileRegEx = new Lazy<Regex>(() =>
		{
			var checkMobile = ConfigurationManager.AppSettings["mobileRegEx"];
			if (!String.IsNullOrEmpty(checkMobile))
				return new Regex(checkMobile, RegexOptions.Compiled);
			return null;
		}, isThreadSafe:true);

		public void CheckIsMobile(String host)
		{
			if (host == null)
				return;
			var re = _checkMobileRegEx.Value;
			if (re == null)
				return;
			this.Mobile = re.IsMatch(host);
		}

		#region ITenantManager

		const String SET_TENANT_CMD = "[a2security].[SetTenantId]";

		public async Task SetTenantIdAsync(SqlConnection cnn, String source)
		{
			if (!IsMultiTenant)
				return;
			if (source == CatalogDataSource)
				return;
			using (Profiler.CurrentRequest.Start(ProfileAction.Sql, SET_TENANT_CMD))
			{
				using (var cmd = cnn.CreateCommand())
				{
					cmd.CommandText = SET_TENANT_CMD;
					cmd.CommandType = System.Data.CommandType.StoredProcedure;
					cmd.Parameters.AddWithValue("@TenantId", TenantId);
					await cmd.ExecuteNonQueryAsync();
				}
			}
		}

		public void SetTenantId(SqlConnection cnn, String source)
		{
			if (!IsMultiTenant)
				return;
			if (source == CatalogDataSource)
				return;
			using (Profiler.CurrentRequest.Start(ProfileAction.Sql, SET_TENANT_CMD))
			{
				using (var cmd = cnn.CreateCommand())
				{
					cmd.CommandText = SET_TENANT_CMD;
					cmd.CommandType = System.Data.CommandType.StoredProcedure;
					cmd.Parameters.AddWithValue("@TenantId", TenantId);
					cmd.ExecuteNonQuery();
				}
			}
		}

		#endregion

	}
}

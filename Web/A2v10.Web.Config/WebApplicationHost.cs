// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Configuration;
using System.Threading.Tasks;
using System.IO;

using A2v10.Infrastructure;
using A2v10.Data.Interfaces;
using System.Data.SqlClient;
using System.Data;
using System.Web.Hosting;
using A2v10.Web.Base;

namespace A2v10.Web.Config
{
	public class WebApplicationHost : A2v10.Infrastructure.IApplicationHost, ITenantManager, IDataConfiguration
	{
		IProfiler _profiler;

		public WebApplicationHost(IProfiler profiler)
		{
			_profiler = profiler;
			_profiler.Enabled = IsDebugConfiguration;
		}

		public IProfiler Profiler => _profiler;

		#region IDataConfiguration

		public String ConnectionString(String source)
		{
			if (String.IsNullOrEmpty(source))
				source = "Default";

			var strSet = ConfigurationManager.ConnectionStrings[source];
			if (strSet == null)
				throw new ConfigurationErrorsException($"Connection string '{source}' not found");
			return strSet.ConnectionString;
		}
		#endregion

		public String AppPath
		{
			get
			{
				String path = ConfigurationManager.AppSettings["appPath"];
				if (path == null)
					throw new InvalidOperationException("Configuration parameter 'appSettings/appPath' not defined");
				if (path.StartsWith("~"))
					path = HostingEnvironment.MapPath(path);
				return path;
			}
		}

		public String AppKey
		{
			get
			{
				// TODO: ???
				return ConfigurationManager.AppSettings["appKey"];

			}
		}

		public String HelpUrl => ConfigurationManager.AppSettings["helpUrl"];
		public String AppDescription => ConfigurationManager.AppSettings["appDescription"];
		public String SupportEmail => ConfigurationManager.AppSettings["supportEmail"];

		public String HostingPath => HostingEnvironment.MapPath("~");

		public String Theme
		{
			get
			{
				String theme = ConfigurationManager.AppSettings["theme"];
				if (String.IsNullOrEmpty(theme))
					return "site";
				return $"site.{theme.ToLowerInvariant()}";
			}
		}

		public Boolean IsMultiTenant
		{
			get
			{
				var mt = ConfigurationManager.AppSettings["multiTenant"];
				if (String.IsNullOrEmpty(mt))
					return false;
				return mt.ToLowerInvariant() == "true";
			}
		}

		public Boolean IsRegistrationEnabled
		{
			get
			{
				var mt = ConfigurationManager.AppSettings["registration"];
				if (String.IsNullOrEmpty(mt))
					return true;
				return mt.ToLowerInvariant() == "true";
			}
		}

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

		public String CatalogDataSource => IsMultiTenant ? "Catalog" : null;
		public String TenantDataSource => null;

		public async Task<String> ReadTextFileAsync(Boolean bAdmin, String path, String fileName)
		{
			String fullPath = MakeFullPath(bAdmin, path, fileName);
			using (var tr = new StreamReader(fullPath))
			{
				return await tr.ReadToEndAsync();
			}
		}

		public String ReadTextFile(Boolean bAdmin, String path, String fileName)
		{
			String fullPath = MakeFullPath(bAdmin, path, fileName);
			using (var tr = new StreamReader(fullPath))
			{
				return tr.ReadToEnd();
			}
		}

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

		public String MakeFullPath(Boolean bAdmin, String path, String fileName)
		{
			String appKey = bAdmin ? "admin" : AppKey;
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

		public String AppVersion => AppInfo.MainAssembly.Version;
		public String AppBuild => AppInfo.MainAssembly.Build;
		public String Copyright => AppInfo.MainAssembly.Copyright;


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
					cmd.CommandType = CommandType.StoredProcedure;
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
					cmd.CommandType = CommandType.StoredProcedure;
					cmd.Parameters.AddWithValue("@TenantId", TenantId);
					cmd.ExecuteNonQuery();
				}
			}
		}

		#endregion
	}
}

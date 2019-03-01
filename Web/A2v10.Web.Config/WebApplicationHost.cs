﻿// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Configuration;
using System.Threading.Tasks;
using System.IO;
using System.Data;

using A2v10.Infrastructure;
using A2v10.Data.Interfaces;

using System.Data.SqlClient;
using System.Web.Hosting;
using A2v10.Web.Base;
using A2v10.Request;

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
				// TODO: ???
				var key =  ConfigurationManager.AppSettings["appKey"];
				return key;
			}
		}

		public String HelpUrl => ConfigurationManager.AppSettings["helpUrl"];
		public String AppDescription => ConfigurationManager.AppSettings["appDescription"];
		public String SupportEmail => ConfigurationManager.AppSettings["supportEmail"];
		public String AppHost => ConfigurationManager.AppSettings["appHost"];

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

		public void StartApplication(Boolean bAdmin)
		{
			var file = ZipApplicationFile;
			String key = bAdmin ? "admin" : AppKey;
			if (file != null)
				_reader = new ZipApplicationReader(AppPath, key);
			else
				_reader = new FileApplicationReader(AppPath, key);
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

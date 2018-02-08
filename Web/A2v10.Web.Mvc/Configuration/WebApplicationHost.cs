// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Configuration;
using System.Threading.Tasks;
using System.IO;

using A2v10.Infrastructure;
using A2v10.Data.Interfaces;
using System.Data.SqlClient;
using System.Data;

namespace A2v10.Web.Mvc.Configuration
{
	public class WebApplicationHost : IApplicationHost, ITenantManager, IDataConfiguration
	{
		IProfiler _profiler;

		public WebApplicationHost(IProfiler profiler)
		{
			_profiler = profiler;
            _profiler.Enabled = IsDebugConfiguration;
        }

		#region IConfiguration
		public IProfiler Profiler => _profiler;

        public String ConnectionString(String source)
		{
            if (String.IsNullOrEmpty(source))
                source = "Default";

            var strSet = ConfigurationManager.ConnectionStrings[source];
            if (strSet == null)
                throw new ConfigurationErrorsException($"Connection string '{source}' not found");
            return strSet.ConnectionString;
		}

        public String AppPath
        {
            get
            {
                String path = ConfigurationManager.AppSettings["appPath"];
                if (path == null)
                    throw new ConfigurationErrorsException("Configuration parameter 'appSettings/appPath' not defined");
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


        Int32 _tenantId;

        public Int32? TenantId {
            get {
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

        public async Task<String> ReadTextFile(Boolean bAdmin, String path, String fileName)
        {
            String fullPath = MakeFullPath(bAdmin, path, fileName);
            using (var tr = new StreamReader(fullPath))
            {
                return await tr.ReadToEndAsync();
            }
        }

        public Boolean IsDebugConfiguration { get { return true; } }

        public String MakeFullPath(Boolean bAdmin, String path, String fileName)
        {
            String appKey = bAdmin ? "admin" : AppKey ;
            if (fileName.StartsWith("/"))
            {
                path = String.Empty;
                fileName = fileName.Remove(0, 1);
            }
            String fullPath = Path.Combine($"{AppPath}/{appKey}", path, fileName);
            return Path.GetFullPath(fullPath);
        }
        #endregion

        public String AppVersion => AppInfo.MainAssembly.Version;
        public String AppBuild => AppInfo.MainAssembly.Build;

        const String SET_TENANT_CMD = "[a2security].[SetTenantId]";

        #region ITenantManager
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

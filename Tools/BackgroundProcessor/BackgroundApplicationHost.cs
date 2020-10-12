// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

using System;
using System.Configuration;
using System.Dynamic;
using System.IO;
using System.Threading.Tasks;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;

namespace BackgroundProcessor
{
	public class BackgroundApplicationHost : IApplicationHost, IDataConfiguration
	{
		private readonly IProfiler _profiler;
		private readonly IApplicationConfig _config;

		public BackgroundApplicationHost(IApplicationConfig config, IProfiler profiler)
		{
			_profiler = profiler;
			_config = config;
		}

		#region IApplicationHost
		public IProfiler Profiler => _profiler;
		public IApplicationConfig Config => _config;

		public Boolean Mobile { get; set; }
		public Boolean IsAdminMode => false;
		public Boolean Embedded => false;


		public Boolean IsRegistrationEnabled => throw new NotImplementedException(nameof(IsRegistrationEnabled));
		public Boolean IsDTCEnabled =>  throw new NotImplementedException(nameof(IsDTCEnabled));
		public Boolean IsAdminAppPresent => throw new NotImplementedException(nameof(IsAdminAppPresent));
		public Boolean IsMultiTenant => throw new NotImplementedException(nameof(IsMultiTenant));
		public Boolean IsUsePeriodAndCompanies => throw new NotImplementedException(nameof(IsUsePeriodAndCompanies));
		public Boolean IsMultiCompany => false;
		public Int32? TenantId { get => throw new NotImplementedException(); set => throw new InvalidOperationException(nameof(TenantId)); }
		public Int64? UserId { get => throw new NotImplementedException(nameof(UserId)); set => throw new InvalidOperationException(nameof(UserId)); }
		public String UserSegment { get => throw new NotImplementedException(nameof(UserId)); set => throw new InvalidOperationException(nameof(UserId)); }
		public String CatalogDataSource => throw new NotImplementedException(nameof(CatalogDataSource));
		public String TenantDataSource => throw new NotImplementedException(nameof(TenantDataSource));
		public String AppVersion => throw new NotImplementedException(nameof(AppVersion));
		public String AppBuild => throw new NotImplementedException(nameof(AppBuild));
		public String Copyright => throw new NotImplementedException(nameof(Copyright));

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

			if (Config.AppPath.StartsWith("db:"))
				_reader = new DbApplicationReader(Config.AppPath);
			else
			{
				String key = bAdminMode ? "admin" : Config.AppKey;
				_reader = new FileApplicationReader(Config.AppPath, key);
			}
		}

		public IApplicationReader ApplicationReader => _reader;

		public String MakeFullPath(Boolean bAdmin, String path, String fileName)
		{
			String appKey = Config.AppKey;
			if (fileName.StartsWith("/"))
			{
				path = String.Empty;
				fileName = fileName.Remove(0, 1);
			}
			if (appKey != null)
				appKey = "/" + appKey;
			String fullPath = Path.Combine($"{Config.AppPath}{appKey}", path, fileName);
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
	}
}

// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

using System;
using System.Configuration;
using System.Dynamic;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;

namespace A2v10.Tests.Config
{
	public class TestApplicationHost : IApplicationHost, IDataConfiguration
	{

		readonly IProfiler _profiler;
		private readonly IApplicationConfig _config;

		public TestApplicationHost(IApplicationConfig config, IProfiler profiler)
		{
			_profiler = profiler;
			_config = config;
		}

		public String ConnectionString(String source)
		{
			if (String.IsNullOrEmpty(source))
				source = "Default";
			var cnnStr = ConfigurationManager.ConnectionStrings[source];
			if (cnnStr == null)
				throw new ConfigurationErrorsException($"Connection string '{source}' not found");
			return cnnStr.ConnectionString;
		}

		public IProfiler Profiler => _profiler;
		public IApplicationConfig Config => _config;

		public Boolean Mobile { get; set; }
		public Boolean Embedded => false;
		public Boolean IsAdminMode => false;


		IApplicationReader _appReader;

		public void SetAdmin(bool bAdmin)
		{
		}

		public void StartApplication(Boolean bAdmin)
		{
			_appReader = new FileApplicationReader(Config.AppPath, Config.AppKey);
		}

		public IApplicationReader ApplicationReader => _appReader;



		public Boolean IsMultiTenant => false;
		public Boolean IsMultiCompany => false;
		public Boolean IsUsePeriodAndCompanies => false;
		public Boolean IsRegistrationEnabled => false;
		public Boolean IsDTCEnabled => false;
		public Boolean IsAdminAppPresent => false;

		public Int32? TenantId { get; set; }
		public Int64? UserId { get; set; }
		public String UserSegment { get; set; }
		public String CatalogDataSource => null;
		public String TenantDataSource => null;

		public String MakeRelativePath(String path, String fileName)
		{
			throw new NotImplementedException(nameof(MakeRelativePath));
		}


#pragma warning disable CA1065
		public String AppVersion => throw new NotSupportedException();
		public String AppBuild => throw new NotSupportedException();
		public String Copyright => throw new NotSupportedException();
#pragma warning restore CA1065

		public String GetAppSettings(String source)
		{
			return source;
		}

		public ExpandoObject GetEnvironmentObject(String key)
		{
			throw new NotImplementedException(nameof(GetEnvironmentObject));
		}
	}
}

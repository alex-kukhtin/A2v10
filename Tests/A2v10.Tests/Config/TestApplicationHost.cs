// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Configuration;
using System.IO;
using System.Reflection;
using System.Threading.Tasks;
using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using A2v10.Request;
using A2v10.Web.Base;

namespace A2v10.Tests.Config
{
	public class TestApplicationHost : IApplicationHost, IDataConfiguration
	{

		readonly IProfiler _profiler;
		public TestApplicationHost(IProfiler profiler)
		{
			_profiler = profiler;
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

		public Boolean Mobile { get; set; }
		public Boolean Embedded => false;


		public String AppPath
		{
			get
			{
				return ConfigurationManager.AppSettings["appPath"];
			}
		}

		public String AppKey
		{
			get
			{
				// TODO: ???
				return ConfigurationManager.AppSettings["appKey"] ?? String.Empty;

			}
		}

		IApplicationReader _appReader;
		public void StartApplication(Boolean bAdmin)
		{
			_appReader = new FileApplicationReader(AppPath, AppKey);
		}

		public IApplicationReader ApplicationReader => _appReader;

		public String AppDescription => ConfigurationManager.AppSettings["appDescription"];
		public String AppHost => ConfigurationManager.AppSettings["appHost"];
		public String UserAppHost => ConfigurationManager.AppSettings["userAppHost"];

		public String SupportEmail => ConfigurationManager.AppSettings["supportEmail"];
		public String SmtpConfig => ConfigurationManager.AppSettings["mailSettings"];

		public String HostingPath { get; set; }

		public String Theme => null;
		public String HelpUrl => null;

		public Boolean IsMultiTenant => false;
		public Boolean IsMultiCompany => false;
		public Boolean IsUsePeriodAndCompanies => false;
		public Boolean IsRegistrationEnabled => false;
		public Boolean IsDebugConfiguration => true;
		public Boolean IsDTCEnabled => false;
		public Boolean IsAdminAppPresent => false;

		public Int32? TenantId { get; set; }
		public Int64? UserId { get; set; }
		public String UserSegment { get; set; }
		public String CatalogDataSource => null;
		public String TenantDataSource => null;

		public String UseClaims => ConfigurationManager.AppSettings["useClaims"];

		public String ScriptEngine => null;

		public String MakeRelativePath(String path, String fileName)
		{
			throw new NotImplementedException();
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
	}
}

// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Configuration;
using System.IO;
using System.Reflection;
using System.Threading.Tasks;
using A2v10.Data.Interfaces;
using A2v10.Infrastructure;

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

		public IProfiler Profiler
		{
			get
			{
				return _profiler;
			}
		}

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
				return ConfigurationManager.AppSettings["appKey"];

			}
		}

		public String AppDescription => ConfigurationManager.AppSettings["appDescription"];
		public String SupportEmail => ConfigurationManager.AppSettings["supportEmail"];

		public String HostingPath { get; set; }

		public String Theme => null;
		public String HelpUrl => null;

		public Boolean IsMultiTenant => false;
		public Boolean IsRegistrationEnabled => false;
		public Boolean IsDebugConfiguration => true;

		public Int32? TenantId { get; set; }
		public String CatalogDataSource => null;
		public String TenantDataSource => null;

		public String UseClaims => ConfigurationManager.AppSettings["useClaims"];

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

		public String MakeRelativePath(String path, String fileName)
		{
			throw new NotImplementedException();
		}

		public Task<String> ReadTextFileAsync(Boolean bAdmin, String path, String fileName)
		{
			throw new NotImplementedException();
		}

		public String ReadTextFile(Boolean bAdmin, String path, String fileName)
		{
			String fullPath = MakeFullPath(bAdmin, path, fileName);
			using (var tr = new StreamReader(fullPath))
			{
				return tr.ReadToEnd();
			}
		}

#pragma warning disable CA1065
		public String AppVersion => throw new NotSupportedException();
		public String AppBuild => throw new NotSupportedException();
		public String Copyright => throw new NotSupportedException();
#pragma warning restore CA1065
	}
}

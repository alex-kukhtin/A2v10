// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Configuration;
using System.Threading.Tasks;
using A2v10.Data.Interfaces;
using A2v10.Infrastructure;

namespace BackgroundProcessor
{
	public class BackgroundApplicationHost : IApplicationHost, IDataConfiguration
	{
		private readonly IProfiler _profiler;

		public BackgroundApplicationHost(IProfiler profiler)
		{
			_profiler = profiler;
		}

		#region IApplicationHost
		public IProfiler Profiler => throw new NotImplementedException();

		public String AppPath => throw new NotImplementedException();
		public String AppKey => throw new NotImplementedException();
		public String AppDescription => throw new NotImplementedException();
		public String SupportEmail => throw new NotImplementedException();
		public String Theme => throw new NotImplementedException();
		public String HelpUrl => throw new NotImplementedException();
		public String HostingPath => throw new NotImplementedException();

		public Boolean IsDebugConfiguration => throw new NotImplementedException();

		public Boolean IsRegistrationEnabled => throw new NotImplementedException();
		public String UseClaims => throw new NotImplementedException();
		public Boolean IsMultiTenant => throw new NotImplementedException();
		public Int32? TenantId { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }
		public String CatalogDataSource => throw new NotImplementedException();
		public String TenantDataSource => throw new NotImplementedException();
		public String AppVersion => throw new NotImplementedException();
		public String AppBuild => throw new NotImplementedException();
		public String Copyright => throw new NotImplementedException();

		public String ConnectionString(String source)
		{
			if (String.IsNullOrEmpty(source))
				source = "Default";

			var strSet = ConfigurationManager.ConnectionStrings[source];
			if (strSet == null)
				throw new ConfigurationErrorsException($"Connection string '{source}' not found");
			return strSet.ConnectionString;
		}

		public String MakeFullPath(Boolean bAdmin, String path, String fileName)
		{
			throw new NotImplementedException();
		}

		public String MakeRelativePath(String path, String fileName)
		{
			throw new NotImplementedException();
		}

		public String ReadTextFile(Boolean bAdmin, String path, String fileName)
		{
			throw new NotImplementedException();
		}

		public Task<String> ReadTextFileAsync(Boolean bAdmin, String path, String fileName)
		{
			throw new NotImplementedException();
		}
		#endregion
	}
}

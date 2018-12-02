// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.IO;
using System.Collections.Generic;
using System.Threading.Tasks;

using A2v10.Infrastructure;

namespace A2v10.Runtime
{

	//<add key = "appPath" value="c:/git/a2v10/apps" />
	//<add key = "appKey" value="develop" />

	public class DesktopApplicationHost : IApplicationHost
	{
		readonly IProfiler _profiler;
		readonly IDictionary<String, String> _cnnStrings = new Dictionary<String, String>();

		public DesktopApplicationHost(IProfiler profiler)
		{
			_profiler = profiler;
		}

		public IProfiler Profiler => _profiler;

		public String AppPath
		{
			get
			{
				// TODO: CONFIG
				return "c:/a2v10demo/apps";
				/*
                String path = ConfigurationManager.AppSettings["appPath"];
                if (path == null)
                    throw new ConfigurationErrorsException("Configuration parameter 'appSettings/appPath' not defined");
                return path;
                */
			}
		}

		public String AppDescription => "A2.Web";
		public String SupportEmail => null;

		public String AppKey
		{
			get
			{
				// TODO: CONFIG
				return "demo"; //ConfigurationManager.AppSettings["appKey"];
			}
		}

		public String Theme => null;
		public String HelpUrl => null;

		public Boolean IsDebugConfiguration
		{
			get
			{
				return true;
			}
		}

		public Boolean IsMultiTenant => false;
		public Boolean IsRegistrationEnabled => false;
		public String UseClaims => null;
		public Int32? TenantId { get; set; }
		public String CatalogDataSource => null;
		public String TenantDataSource => null;

		public String AppVersion => AppInfo.MainAssembly.Version;
		public String AppBuild => AppInfo.MainAssembly.Build;
		public String Copyright => AppInfo.MainAssembly.Copyright;

		public String ConnectionString(String source)
		{
			if (String.IsNullOrEmpty(source))
				source = "Default";

			if (source == "Default")
				return "Data Source=localhost;Initial Catalog=a2v10demo;Integrated Security=True";

			throw new ArgumentOutOfRangeException($"Connection string '{source}' not found");
			/*
            String cnnStr = null;
            if (_cnnStrings.TryGetValue(source, out cnnStr))
                return cnnStr;
            var strSet = ConfigurationManager.ConnectionStrings[source];
            if (strSet == null)
                throw new ConfigurationErrorsException($"Connection string '{source}' not found");
            cnnStr = strSet.ConnectionString;
            _cnnStrings.Add(source, strSet.ConnectionString);
            return cnnStr;
            */
		}

		public String MakeFullPath(Boolean bAdmin, String path, String fileName)
		{
			String appKey = bAdmin ? "admin" : AppKey;
			String fullPath = Path.Combine($"{AppPath}/{appKey}", path, fileName);
			return Path.GetFullPath(fullPath);
		}

		public String MakeRelativePath(String path, String fileName)
		{
			throw new NotImplementedException();
		}

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
	}
}

// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.IO;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Reflection;

using A2v10.Infrastructure;
using A2v10.Data.Interfaces;
using System.Data.SqlClient;
using A2v10.Web.Base;

namespace A2v10.Runtime
{

	//<add key = "appPath" value="c:/git/a2v10/apps" />
	//<add key = "appKey" value="develop" />

	public class DesktopApplicationHost : IApplicationHost, ITenantManager, IDataConfiguration
	{
		readonly IProfiler _profiler;
		readonly IDictionary<String, String> _cnnStrings = new Dictionary<String, String>();

		public DesktopApplicationHost(IProfiler profiler)
		{
			_profiler = profiler;
			_profiler.Enabled = IsDebugConfiguration;
		}

		public IProfiler Profiler => _profiler;

		public String AppPath
		{
			get
			{
				// TODO: CONFIG
				return "C:/Git/app.main/apps";
				/*
                String path = ConfigurationManager.AppSettings["appPath"];
                if (path == null)
                    throw new ConfigurationErrorsException("Configuration parameter 'appSettings/appPath' not defined");
                return path;
                */
			}
		}

		public String HostingPath
		{
			get
			{
				var path = Assembly.GetExecutingAssembly().Location;
				return Path.GetDirectoryName(path);
			}
		}

		public String AppDescription => "A2v10.Desktop";
		public String SupportEmail => null;
		public String AppHost => null;

		public String AppKey
		{
			get
			{
				// TODO: CONFIG
				return "main"; //ConfigurationManager.AppSettings["appKey"];
			}
		}

		public String Theme => null;
		public String HelpUrl => "http://help";

		public Boolean IsDebugConfiguration
		{
			get
			{
				return true;
			}
		}

		IApplicationReader _reader = null;

		public void StartApplication(Boolean bAdmin)
		{
			var file = ZipApplicationFile;
			String key = bAdmin ? "admin" : AppKey;
			if (file != null)
				_reader = new ZipApplicationReader(AppPath, key);
			else
				_reader = new FileApplicationReader(AppPath, key);
		}

		public IApplicationReader ApplicationReader
		{
			get
			{
				if (_reader == null)
					throw new InvalidProgramException("ApplicationReader is not configured");
				return _reader;
			}
		}

		public Boolean IsMultiTenant => true; // TODO:
		public Boolean IsRegistrationEnabled => false;
		public String UseClaims => null;
		public Int32? TenantId { get; set; } 
		public String CatalogDataSource => "Catalog";
		public String TenantDataSource => null;

		public String AppVersion => AppInfo.MainAssembly.Version;
		public String AppBuild => AppInfo.MainAssembly.Build;
		public String Copyright => AppInfo.MainAssembly.Copyright;

		public String ConnectionString(String source)
		{
			return "Data Source=localhost;Initial Catalog=bookkeeper;Integrated Security=True";
			/*
			if (String.IsNullOrEmpty(source))
				source = "Default";

			if (source == "Default")
				return "Data Source=localhost;Initial Catalog=a2v10demo;Integrated Security=True";
			*/

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

		public String ZipApplicationFile
		{
			get
			{
				var path = Path.Combine(AppPath, AppKey);
				path = Path.ChangeExtension(path, ".app");
				if (File.Exists(path))
				{
					return path;
				}
				return null;
			}
		}

		#region ITenantManager

		public Task SetTenantIdAsync(SqlConnection cnn, String source)
		{
			return Task.FromResult(0);
		}

		public void SetTenantId(SqlConnection cnn, String source)
		{
		}
		#endregion
	}
}

// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.IO;
using Newtonsoft.Json;

using A2v10.Infrastructure;

namespace A2v10.Request
{
	public class RedirectModule
	{
		private readonly IApplicationHost _host;
		private IDictionary<String, String> _redirect = new Dictionary<String, String>(StringComparer.OrdinalIgnoreCase);
		private Object _redirectLock = new Object();
		private FileSystemWatcher _redirectWatcher;


		public RedirectModule()
		{
			_host = ServiceLocator.Current.GetService<IApplicationHost>();
			Start();
		}

		public void Start()
		{
			CreateWatcher();
			Read();
		}

		public void Read()
		{
			String redJson = _host.ApplicationReader.ReadTextFile(String.Empty, "redirect.json");
			if (redJson != null)
			{
				var dict = JsonConvert.DeserializeObject<Dictionary<String, String>>(redJson);
				lock (_redirectLock) {
					_redirect.Clear();
					_redirect.Append(dict, replaceExisiting: true);
				}
			}
		}

		public void CreateWatcher()
		{
			if (_host.IsProductionEnvironment)
				return;
			if (_host.IsDebugConfiguration && _redirectWatcher == null && _host.ApplicationReader.IsFileSystem)
			{
				String redFilePath = _host.ApplicationReader.MakeFullPath(String.Empty, "redirect.json");
				var dirName = Path.GetDirectoryName(redFilePath);
				if (!Directory.Exists(dirName))
					return;
				// FileName can be in 8.3 format!
				_redirectWatcher = new FileSystemWatcher(Path.GetDirectoryName(redFilePath), "*.*")
				{
					NotifyFilter = NotifyFilters.LastWrite | NotifyFilters.Size | NotifyFilters.Attributes
				};
				_redirectWatcher.Changed += (sender, e) =>
				{
					Read();
				};
				_redirectWatcher.EnableRaisingEvents = true;
			}
		}

		public String Redirect(String path)
		{
			if (_redirect.Count == 0)
				return path;
			if (_redirect.TryGetValue(path, out String outPath))
				return outPath;
			return path;
		}
	}
}

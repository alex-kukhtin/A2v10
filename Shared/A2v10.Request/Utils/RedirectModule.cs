// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.IO;
using Newtonsoft.Json;
using A2v10.Infrastructure;
using System.Security.Permissions;

namespace A2v10.Request
{
	public class RedirectModule
	{
		private readonly IApplicationHost _host;
		private IDictionary<String, String> _redirect;
		private FileSystemWatcher _redirectWatcher;
		private Boolean _loaded;


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
			if (_loaded)
				return;
			String redJson = _host.ApplicationReader.ReadTextFile(String.Empty, "redirect.json");
			if (redJson != null)
				_redirect = JsonConvert.DeserializeObject<Dictionary<String, String>>(redJson);
			_loaded = true;
		}

		public void CreateWatcher()
		{ 
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
					_loaded = false;
				};
				_redirectWatcher.EnableRaisingEvents = true;
			}
		}

		public String Redirect(String path)
		{
			Read();
			if (_redirect == null)
				return path;
			if (_redirect.TryGetValue(path, out String outPath))
				return outPath;
			return path;
		}
	}
}

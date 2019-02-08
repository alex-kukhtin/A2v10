// Copyright © 2012-2019 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.IO;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using A2v10.Runtime.Properties;

namespace A2v10.Runtime
{
	class LocaleMapItem
	{
		public Dictionary<String, String> Map { get; }
		public Boolean Loaded { get; set; }

		public LocaleMapItem()
		{
			Map = new Dictionary<String, String>();
		}

		public void AddOrUpdate(String key, String val) {
			if (Map.ContainsKey(key))
				Map[key] = val;
			else
				Map.Add(key, val);
		}
	}

	public class DesktopLocalizer : BaseLocalizer, IDataLocalizer
	{
		private IApplicationHost _host;

		public DesktopLocalizer(IApplicationHost host)
		{
			_host = host;
		}

		static Dictionary<String, LocaleMapItem> _maps = new Dictionary<String, LocaleMapItem>();

		LocaleMapItem GetCurrentMap(String locale)
		{
			if (_maps.TryGetValue(locale, out LocaleMapItem mapItem))
				return mapItem;
			mapItem = new LocaleMapItem();
			_maps.Add(locale, mapItem);
			return mapItem;
		}

		protected override IDictionary<String, String> GetLocalizerDictionary(String locale)
		{

			var map = GetCurrentMap(locale);
			if (map.Loaded)
				return map.Map;
			map.Loaded = true;

			void AddLine(String line)
			{
				if (String.IsNullOrWhiteSpace(line))
					return;
				if (line.StartsWith(";"))
					return;
				Int32 pos = line.IndexOf('=');
				if (pos != -1)
				{
					var key = line.Substring(0, pos);
					var val = line.Substring(pos + 1);
					map.AddOrUpdate(key, val);
				}
				else
				{
					throw new InvalidDataException($"Invalid dictionary string '{line}'");
				}
			}

			// TODO: localize
			var ukGlobal = Resources.default_uk.Split('\n', '\r');
			foreach (var line in ukGlobal)
				AddLine(line);

			foreach (var path in GetLocalizerFilePath(locale))
			{
				var lines = File.ReadAllLines(path);
				foreach (var line in lines)
					AddLine(line);
			}
			return map.Map;
		}

		IEnumerable<String> GetLocalizerFilePath(String locale)
		{
			var appPath = Path.GetFullPath(Path.Combine(_host.AppPath, _host.AppKey ?? String.Empty, "_localization"));
			if (!Directory.Exists(appPath))
				appPath = null;
			if (appPath != null)
			{
				foreach (var s in Directory.EnumerateFiles(appPath, $"*.{locale}.txt"))
					yield return s;
			}
			// simple locale: uk
			if (locale.Length > 2)
			{
				locale = locale.Substring(0, 2);
				if (appPath != null)
				{
					foreach (var s in Directory.EnumerateFiles(appPath, $"*.{locale}.txt"))
						yield return s;
				}
			}
		}

		public String Localize(String content)
		{
			return Localize(null, content, true);
		}
	}
}

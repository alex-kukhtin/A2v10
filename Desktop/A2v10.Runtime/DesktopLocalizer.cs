// Copyright © 2012-2019 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
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

	struct LocalePath
	{
		public String Path;
		public Boolean IsFileSystem;

		public LocalePath(String path, Boolean fs)
		{
			Path = path;
			IsFileSystem = fs;
		}
	}

	public class DesktopUserLocale : IUserLocale
	{
		public String Locale { get; set; }
		public String Language => Thread.CurrentThread.CurrentUICulture.TwoLetterISOLanguageName;
	}

	public class DesktopLocalizer : BaseLocalizer, IDataLocalizer
	{
		private IApplicationHost _host;

		public DesktopLocalizer(IApplicationHost host, IUserLocale userLocale)
			: base(userLocale)
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

		IEnumerable<String> ReadLines(IApplicationReader reader, String path)
		{
			using (var stream = reader.FileStreamFullPathRO(path))
			{
				using (var rdr = new StreamReader(stream))
				{
					while (!rdr.EndOfStream)
					{
						var s = rdr.ReadLine();
						if (String.IsNullOrEmpty(s) || s.StartsWith(";"))
							continue;
						yield return s;
					}
				}
			}
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


			foreach (var localePath in GetLocalizerFilePath(locale))
			{
				var lines = ReadLines(_host.ApplicationReader, localePath.Path);
				foreach (var line in lines)
					AddLine(line);
			}
			return map.Map;
		}

		IEnumerable<LocalePath> GetLocalizerFilePath(String locale)
		{
			// locale may be "uk_UA"
			var dirPath = System.Web.Hosting.HostingEnvironment.MapPath("~/Localization");
			var appReader = _host.ApplicationReader;
			///var appPath = Path.GetFullPath(Path.Combine(_host.AppPath, _host.AppKey ?? String.Empty, "_localization"));
			var appPath = appReader.MakeFullPath("_localization", String.Empty);
			if (!Directory.Exists(dirPath))
				dirPath = null;

			if (!appReader.DirectoryExists(appPath))
				appPath = null;

			if (dirPath != null)
			{
				foreach (var s in Directory.EnumerateFiles(dirPath, $"*.{locale}.txt"))
					yield return new LocalePath(s, true);
			}
			var appFiles = appReader.EnumerateFiles(appPath, $"*.{locale}.txt");
			if (appFiles != null)
			{
				foreach (var s in appFiles)
					yield return new LocalePath(s, false);
			}
			// simple locale: uk
			if (locale.Length > 2)
			{
				locale = locale.Substring(0, 2);
				if (dirPath != null)
				{
					foreach (var s in Directory.EnumerateFiles(dirPath, $"*.{locale}.txt"))
						yield return new LocalePath(s, true);
				}
				appFiles = appReader.EnumerateFiles(appPath, $"*.{locale}.txt");
				if (appFiles != null)
				{
					foreach (var s in appFiles)
						yield return new LocalePath(s, false);
				}
			}
		}

		public String Localize(String content)
		{
			return Localize(null, content, true);
		}
	}
}

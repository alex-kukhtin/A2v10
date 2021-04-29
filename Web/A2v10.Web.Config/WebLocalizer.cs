// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Threading;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;

namespace A2v10.Web.Config
{

	class LocaleMapItem
	{
		public ConcurrentDictionary<String, String> Map { get; } = new ConcurrentDictionary<String, String>();

		public LocaleMapItem(Action<ConcurrentDictionary<String, String>> load)
		{
			load(Map);
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

	internal class WebDictionary
	{
		private static readonly ConcurrentDictionary<String, LocaleMapItem> _maps = new ConcurrentDictionary<String, LocaleMapItem>();
		FileSystemWatcher _watcher_system = null;
		FileSystemWatcher _watcher_app = null;

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

		public IDictionary<String, String> GetLocalizerDictionary(IApplicationHost host, String locale)
		{
			var localmap = GetCurrentMap(locale, (map) =>
			{
				foreach (var localePath in GetLocalizerFilePath(host, locale))
				{
					var lines = ReadLines(host.ApplicationReader, localePath.Path);
					foreach (var line in lines)
					{
						Int32 pos = line.IndexOf('=');
						if (pos != -1)
						{
							var key = line.Substring(0, pos).Trim();
							var val = line.Substring(pos + 1).Trim();
							map.AddOrUpdate(key, val, (k, oldVal) => val);
						}
						else
							throw new InvalidDataException($"Invalid dictionary string '{line}'");
					}
				}
			});
			return localmap.Map;
		}

		IEnumerable<LocalePath> GetLocalizerFilePath(IApplicationHost host, String locale)
		{
			// locale may be "uk_UA"
			var dirPath = System.Web.Hosting.HostingEnvironment.MapPath("~/Localization");
			var appReader = host.ApplicationReader;
			var appPath = Path.Combine(host.AppPath, host.AppKey, "_localization");
			// нельзя использовать appReader.MakeFullPath()! Там может быть AppKey = "admin"
			if (!Directory.Exists(dirPath))
				dirPath = null;

			if (!appReader.DirectoryExists(appPath))
				appPath = null;

			CreateWatchers(host, dirPath, appReader.IsFileSystem ? appPath : null);
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


		LocaleMapItem GetCurrentMap(String locale, Action<ConcurrentDictionary<String, String>> load)
		{
			return _maps.GetOrAdd(locale, (key) => new LocaleMapItem(load));
		}


		void CreateWatchers(IApplicationHost host, String dirPath, String appPath)
		{
			if (_watcher_system != null)
				return;
			if (!host.IsDebugConfiguration || host.IsProductionEnvironment)
				return;
			if (!String.IsNullOrEmpty(dirPath))
			{
				// FileName can be in 8.3 format!
				_watcher_system = new FileSystemWatcher(dirPath, "*.*")
				{
					NotifyFilter = NotifyFilters.LastWrite | NotifyFilters.Size | NotifyFilters.Attributes
				};
				_watcher_system.Changed += _watcher_Changed;
				_watcher_system.Created += _watcher_Changed;
				_watcher_system.Deleted += _watcher_Changed;
				_watcher_system.EnableRaisingEvents = true;
			}

			if (!String.IsNullOrEmpty(appPath))
			{
				// FileName can be in 8.3 format!
				_watcher_app = new FileSystemWatcher(appPath, "*.*")
				{
					NotifyFilter = NotifyFilters.LastWrite | NotifyFilters.Size | NotifyFilters.Attributes
				};
				_watcher_app.Changed += _watcher_Changed;
				_watcher_app.Created += _watcher_Changed;
				_watcher_app.Deleted += _watcher_Changed;
				_watcher_app.EnableRaisingEvents = true;
			}
		}

		private void _watcher_Changed(Object sender, FileSystemEventArgs e)
		{
			_maps.Clear();
		}
	}


	public class WebUserLocale : IUserLocale
	{
		public String Locale { get; set; }

		public String Language
		{
			get
			{
				var loc = Locale;
				if (loc != null)
					return loc.Substring(0, 2);
				else
					return Thread.CurrentThread.CurrentUICulture.TwoLetterISOLanguageName;
			}
		}

		private static IEnumerable<String> AvailableLocales()
		{
			var avail = ConfigurationManager.AppSettings["availableLocales"];
			if (avail == null)
				return Enumerable.Empty<String>();
			return avail.Split(',');
		}

		public static String AvaliableLanguages()
		{
			var avail = AvailableLocales();
			return String.Join(",", avail.Select(x => x.Substring(0, 2)).ToArray());
		}

		public static String Lang2Locale(String lang)
		{
			if (lang == null)
				return null;
			var avail = AvailableLocales();
			var loc = avail.FirstOrDefault(x => x.Trim().StartsWith(lang, StringComparison.OrdinalIgnoreCase));
			return loc?.Trim();
		}

		public static String CheckLocale(String locale)
		{
			if (locale == null)
				return null;
			var avail = AvailableLocales();
			if (avail.Any(x => x.Trim() == locale))
				return locale;
			return null;
		}
	}

	public class WebLocalizer : BaseLocalizer, IDataLocalizer
	{
		private readonly IApplicationHost _host;

		private readonly WebDictionary _webDictionary = new WebDictionary();

		public WebLocalizer(IApplicationHost host, IUserLocale userLocale)
			: base(userLocale)
		{
			_host = host;
		}

		protected override IDictionary<String, String> GetLocalizerDictionary(String locale)
		{
			return _webDictionary.GetLocalizerDictionary(_host, locale);
		}

		String IDataLocalizer.Localize(String content)
		{
			return Localize(_userLocale.Locale, content, true);
		}
	}
}

// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.IO;
using A2v10.Infrastructure;

namespace A2v10.Web.Mvc.Configuration
{

    class LocaleMapItem
    {
        public IDictionary<String, String> Map { get; }
        public Boolean Loaded { get; set; }

        public LocaleMapItem()
        {
            Map = new Dictionary<String, String>();
        }
    }

    public class WebLocalizer : BaseLocalizer
    {
        private IApplicationHost _host;

        public WebLocalizer(IApplicationHost host)
        {
            _host = host;
        }

        static IDictionary<String, LocaleMapItem> _maps = new Dictionary<String, LocaleMapItem>();
        static FileSystemWatcher _watcher_system;
        static FileSystemWatcher _watcher_app;

        protected override IDictionary<String, String> GetLocalizerDictionary(String locale)
        {
            var map = GetCurrentMap(locale);
            if (map.Loaded)
                return map.Map;

            foreach (var path in GetLocalizerFilePath(locale))
            {
                var lines = File.ReadAllLines(path);
                foreach (var line in lines)
                {
                    if (!String.IsNullOrWhiteSpace(line))
                    {
                        if (line.StartsWith(";"))
                            continue;
                        var split = line.Split('=');
                        if (split.Length == 2)
                        {
                            map.Map.Add(split[0].Trim(), split[1].Trim());
                        }
                    }
                }
            }
            map.Loaded = true;
            return map.Map;
        }

        LocaleMapItem GetCurrentMap(String locale)
        {
            LocaleMapItem result;
            if (_maps.TryGetValue(locale, out result))
            {
                return result;
            }
            result = new LocaleMapItem();
            _maps.Add(locale, result);
            return result;
        }

        void CreateWatchers(String dirPath, String appPath)
        {
            if (_watcher_system != null)
                return;
            if (!_host.IsDebugConfiguration)
                return;
            _watcher_system = new FileSystemWatcher(dirPath, "*.txt");
            _watcher_system.NotifyFilter = NotifyFilters.LastWrite | NotifyFilters.Size | NotifyFilters.Attributes | NotifyFilters.LastAccess;
            _watcher_system.Changed += _watcher_Changed;
            _watcher_system.EnableRaisingEvents = true;

            _watcher_app = new FileSystemWatcher(appPath, "*.txt");
            _watcher_app.NotifyFilter = NotifyFilters.LastWrite | NotifyFilters.Size | NotifyFilters.Attributes | NotifyFilters.LastAccess;
            _watcher_app.Changed += _watcher_Changed;
            _watcher_app.EnableRaisingEvents = true;
        }

        private void _watcher_Changed(Object sender, FileSystemEventArgs e)
        {
            _maps.Clear();
        }

        IEnumerable<String> GetLocalizerFilePath(String locale)
        {
            // locale may be "uk_UA"
            var dirPath = System.Web.Hosting.HostingEnvironment.MapPath("~/Localization");
            var appPath = _host.AppPath;
            CreateWatchers(dirPath, appPath);
            foreach (var s in Directory.EnumerateFiles(dirPath, $"*.{locale}.txt"))
            {
                yield return s;
            }
            foreach (var s in Directory.EnumerateFiles(appPath, $"*.{locale}.txt"))
            {
                yield return s;
            }
            // simple locale: uk
            if (locale.Length > 2)
            {
                locale = locale.Substring(0, 2);
            }
            foreach (var s in Directory.EnumerateFiles(dirPath, $"*.{locale}.txt"))
            {
                yield return s;
            }
            foreach (var s in Directory.EnumerateFiles(appPath, $"*.{locale}.txt"))
            {
                yield return s;
            }
        }

    }
}

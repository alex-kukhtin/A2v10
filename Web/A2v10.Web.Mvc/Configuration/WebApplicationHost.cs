using System;
using System.Configuration;
using A2v10.Infrastructure;
using System.Threading.Tasks;
using System.IO;

namespace A2v10.Web.Mvc.Configuration
{
	public class WebApplicationHost : IApplicationHost
	{
		IProfiler _profiler;
		String _cnnStr = null;

		public WebApplicationHost(IProfiler profiler)
		{
			_profiler = profiler;
		}

		#region IConfiguration
		public IProfiler Profiler => _profiler;
		public String ConnectionString
		{
            get
            {
                if (_cnnStr == null)
                {
                    var strSet = ConfigurationManager.ConnectionStrings["Default"];
                    if (strSet == null)
                    {
                        throw new ConfigurationErrorsException("ConnectionString \"Default\" not found");
                    }
                    _cnnStr = strSet.ConnectionString;
                }
                return _cnnStr;
            }
		}

        public String AppPath
        {
            get
            {
                String path = ConfigurationManager.AppSettings["appPath"];
                if (path == null)
                    throw new ConfigurationErrorsException("Configuration parameter 'appSettings/appPath' not defined");
                return path;
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

        public async Task<String> ReadTextFile(String path, String fileName)
        {
            String fullPath = MakeFullPath(path, fileName);
            using (var tr = new StreamReader(fullPath))
            {
                return await tr.ReadToEndAsync();
            }
        }

        public Boolean IsDebugConfiguration { get { return true; } }

        public String MakeFullPath(String path, String fileName)
        {
            String fullPath = Path.Combine($"{AppPath}/{AppKey}", path, fileName);
            return Path.GetFullPath(fullPath);
        }
        #endregion

    }
}

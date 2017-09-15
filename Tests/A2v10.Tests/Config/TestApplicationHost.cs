using A2v10.Infrastructure;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Tests.Config
{
	public class TestApplicationHost : IApplicationHost
	{

		IProfiler _profiler;
		public TestApplicationHost(IProfiler profiler)
		{
			_profiler = profiler;
		}

		public String ConnectionString(String source)
		{
            if (String.IsNullOrEmpty(source))
                source = "Default";
            var cnnStr = ConfigurationManager.ConnectionStrings[source];
            if (cnnStr == null)
                throw new ConfigurationErrorsException($"Connection string '{source}' not found");
            return cnnStr.ConnectionString;
		}

		public IProfiler Profiler
		{
			get
			{
				return _profiler;
			}
		}

        public String AppPath
        {
            get
            {
                return ConfigurationManager.AppSettings["appPath"];
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

        public Boolean IsDebugConfiguration { get { return true; } }

        public String MakeFullPath(Boolean bAdmin, String path, String fileName)
        {
            throw new NotImplementedException();
        }

        public Task<String> ReadTextFile(Boolean bAdmin, String path, String fileName)
        {
            throw new NotImplementedException();
        }

        public String AppVersion => throw new NotImplementedException();
    }
}

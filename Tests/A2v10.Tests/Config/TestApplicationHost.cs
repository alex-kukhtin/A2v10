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

		public String ConnectionString
		{
            get
            {
                var cnnStr = ConfigurationManager.ConnectionStrings["Default"];
                if (cnnStr == null)
                    throw new ConfigurationErrorsException("ConnectionString \"Default\" not found");
                return cnnStr.ConnectionString;
            }
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

        public String MakeFullPath(String path, String fileName)
        {
            throw new NotImplementedException();
        }

        public Task<String> ReadTextFile(String path, String fileName)
        {
            throw new NotImplementedException();
        }
    }
}

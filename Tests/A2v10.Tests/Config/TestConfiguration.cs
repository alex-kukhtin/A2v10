using A2v10.Infrastructure;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Tests.Config
{
	public class TestConfiguration : IConfiguration
	{

		IProfiler _profiler;
		public TestConfiguration(IProfiler profiler)
		{
			_profiler = profiler;
		}

		public String GetConnectionString()
		{
			var cnnStr = ConfigurationManager.ConnectionStrings["Default"];
			if (cnnStr == null)
				throw new ConfigurationErrorsException("ConnectionString \"Default\" not found");
			return cnnStr.ConnectionString;
		}

		public IProfiler Profiler
		{
			get
			{
				return _profiler;
			}
		}
	}
}

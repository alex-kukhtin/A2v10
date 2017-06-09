using System;
using System.Configuration;
using A2v10.Infrastructure;

namespace A2v10.Web.Mvc.Configuration
{
	public class WebConfiguration : IConfiguration
	{
		IProfiler _profiler;
		String _cnnStr = null;

		public WebConfiguration(IProfiler profiler)
		{
			_profiler = profiler;
		}

		#region IConfiguration
		public IProfiler Profiler => _profiler;

		public string GetConnectionString()
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
		#endregion
	}
}

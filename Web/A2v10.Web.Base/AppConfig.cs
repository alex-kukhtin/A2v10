
using System;
using System.Configuration;
using System.IO;

namespace A2v10.Web.Base
{
	public static class AppConfig
	{
		public static String AppPath()
		{
			String appPath = ConfigurationManager.AppSettings["appPath"];
			if (appPath == null)
				throw new ConfigurationErrorsException("Configuration parameter 'appSettings/appPath' not defined");
			if (!appPath.StartsWith("~"))
				appPath = "~/" + appPath;
			return appPath;
		}

		public static String AppKey()
		{
			var appKey = ConfigurationManager.AppSettings["appKey"];
			if (appKey != null)
				appKey = "/" + appKey;
			return appKey;
		}
	}
}

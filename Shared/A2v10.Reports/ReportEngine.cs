// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.IO;

namespace A2v10.Reports
{
	public class ReportEngine
	{
		public static void SetLicense(String serverPath)
		{
			String licPath = Path.Combine(serverPath, "licenses", "stimulsoft.license.key");
			if (File.Exists(licPath))
			{
				Stimulsoft.Base.StiLicense.LoadFromFile(licPath);
			}
		}
	}
}

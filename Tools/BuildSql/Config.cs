// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using System;

namespace BuildSql
{
	public class ConfigItem
	{
#pragma warning disable IDE1006 // Naming Styles
		public String version { get; set; }
		public String name { get; set; }
		public Boolean replaceSessionContext { get; set; }
		public String remove { get; set; }
		public String outputFile { get; set; }
		public String[] inputFiles { get; set; }
#pragma warning restore IDE1006 // Naming Styles

		public Int32 NumVersion
		{
			get
			{
				if (String.IsNullOrEmpty(version))
					return 0;
				Int32 pos = version.LastIndexOf(".");
				if (pos != -1)
					return Int32.Parse(version.Substring(pos + 1));
				else
					return Int32.Parse(version);
			}
		}
	}
}

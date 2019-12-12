// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using System;

namespace BuildSql
{
	public class ConfigItem
	{
#pragma warning disable IDE1006 // Naming Styles
		public String version { get; set; }
		public Boolean replaceSessionContext { get; set; }
		public String outputFile { get; set; }
		public String[] inputFiles { get; set; }
#pragma warning restore IDE1006 // Naming Styles
	}
}

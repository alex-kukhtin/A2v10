// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Text.RegularExpressions;

namespace A2v10.Infrastructure
{
	public class ClrHelpers
	{
		public static (String assembly, String type) ParseClrType(String clrType)
		{
			var regex = new Regex(@"^\s*clr-type\s*:\s*([\w\.]+)\s*;\s*assembly\s*=\s*([\w\.]+)\s*$");
			var match = regex.Match(clrType);
			if (match.Groups.Count != 3)
			{
				String errorMsg = $"Invalid clrType definition: '{clrType}'. Expected: 'clr-type:TypeName;assembly=AssemblyName'";
				throw new ArgumentException(errorMsg);
			}
			String assemblyName = match.Groups[2].Value.Trim();
			String typeName = match.Groups[1].Value.Trim();
			return (assemblyName, typeName);
		}
	}
}

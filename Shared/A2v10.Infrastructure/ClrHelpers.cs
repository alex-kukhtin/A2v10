// Copyright © 2015-2022 Alex Kukhtin. All rights reserved.

using System;
using System.Reflection;
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

		public static T LoadObjectDI<T>(String clrType)
		{
			var (assembly, type) = ClrHelpers.ParseClrType(clrType);
			var ass = Assembly.Load(assembly);
			var handlerType = ass.GetType(type);
			var ctors = handlerType.GetConstructors();
			if (ctors.Length != 1)
			{
				String errorMsg = $"Object '{type}' must have only one ctor";
				throw new ArgumentException(errorMsg);
			}
			var ctor = ctors[0];
			var ctorParams = ctor.GetParameters();
			var prms = new Object[ctorParams.Length];
			var currSL = ServiceLocator.Current;
			for (int i=0; i<ctorParams.Length; i++)
			{
				prms[i] = currSL.GetService(ctorParams[i].ParameterType);
			}
			var res = ctor.Invoke(prms);
			if (res is T resT)
				return resT;
			return default;
		}
	}
}

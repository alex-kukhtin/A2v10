// Copyright © 2022 Alex Kukhtin. All rights reserved.

using System;
using System.Linq;
using System.Reflection;

namespace A2v10.Web.Mvc
{
	[AttributeUsage(AttributeTargets.Assembly)]
	public class EntryAssemblyAttribute : Attribute
	{
		public static Assembly GetEntryAssembly()
		{
			var allass = AppDomain.CurrentDomain.GetAssemblies();
			return allass.Where(x =>
				!x.FullName.StartsWith("System") &&
				!x.FullName.StartsWith("Microsoft") &&
				x.GetCustomAttribute(typeof(EntryAssemblyAttribute)) != null
			).First();
		}
	}
}

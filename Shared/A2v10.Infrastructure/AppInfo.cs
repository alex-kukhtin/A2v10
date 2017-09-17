
using System;
using System.Reflection;

namespace A2v10.Infrastructure
{

	public class AssemblyDescription
	{
		public String Name { get; private set; }
		public String ProductName { get; private set; }
		public String Version { get; private set; }
		public String Copyright { get; private set; }

		public AssemblyDescription(AssemblyName an, String productName, String copyright)
		{
			Name = an.Name;
			ProductName = productName;
			Version = String.Format("{0}.{1}.{2}", an.Version.Major, an.Version.Minor, an.Version.Build);
			Copyright = copyright.Replace("(C)", "©").Replace("(c)", "©");
		}
	}

	public class AppInfo
	{
		public static AssemblyDescription MainAssembly
		{
			get
			{
				return GetDescription(Assembly.GetExecutingAssembly());
			}
		}

		static AssemblyDescription GetDescription(Assembly a)
		{
			var c = a.GetCustomAttributes(typeof(AssemblyCopyrightAttribute), false)[0];
			var n = a.GetCustomAttributes(typeof(AssemblyProductAttribute), false)[0];
			return new AssemblyDescription(a.GetName(),
				(n as AssemblyProductAttribute).Product,
				(c as AssemblyCopyrightAttribute).Copyright);
		}
	}
}

// Copyright © 2020 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using A2v10.Infrastructure;

namespace A2v10.Javascript
{
	public class ScriptConfig
	{
		IApplicationHost _host;

		public ScriptConfig(IApplicationHost host)
		{
			_host = host;
		}

#pragma warning disable IDE1006 // Naming Styles
		public ExpandoObject appSettings(String name)
#pragma warning restore IDE1006 // Naming Styles
		{
			return _host.GetEnvironmentObject(name);
		}
	}
}

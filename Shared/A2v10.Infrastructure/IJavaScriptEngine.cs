﻿// Copyright © 2019-2020 Alex Kukhtin. All rights reserved.


using System;
using System.Dynamic;

namespace A2v10.Infrastructure
{
	public interface IJavaScriptEngine
	{
		void SetCurrentDirectory(String dir);
		Object Execute(String script, ExpandoObject prms, ExpandoObject args);
	}
}

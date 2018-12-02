// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Infrastructure
{
	public interface IScriptContext
	{
		void Start();

		void LoadLibrary(String script);
		Object RunScript(String script);

		Boolean IsValid { get; }
	}
}

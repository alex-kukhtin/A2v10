// Copyright © 2019-2020 Alex Kukhtin. All rights reserved.


using System;

namespace A2v10.Infrastructure
{
	public interface IJavaScriptEngine
	{
		Object Execute(String script, Object prms);
	}
}

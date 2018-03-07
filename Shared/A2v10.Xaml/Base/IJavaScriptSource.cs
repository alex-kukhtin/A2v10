// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
	internal interface IJavaScriptSource
	{
		String GetJsValue(RenderContext context);
	}
}

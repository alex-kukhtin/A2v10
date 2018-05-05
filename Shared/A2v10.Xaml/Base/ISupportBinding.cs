// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml
{
	internal interface ISupportBinding
	{
		BindImpl BindImpl { get; }
		Bind GetBinding(String name);
		BindCmd GetBindingCommand(String name);
	}
}

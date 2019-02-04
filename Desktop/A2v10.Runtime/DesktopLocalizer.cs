// Copyright © 2012-2019 Alex Kukhtin. All rights reserved.

using System;
using A2v10.Data.Interfaces;
using A2v10.Infrastructure;

namespace A2v10.Runtime
{
	public class DesktopLocalizer : ILocalizer, IDataLocalizer
	{
		public String Localize(String locale, String content, Boolean replaceNewLine = true)
		{
			return content;
		}

		public String Localize(String content)
		{
			return content;
		}
	}
}

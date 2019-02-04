// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using System;
using A2v10.Data.Interfaces;

namespace A2v10.Infrastructure
{
	public class NullLocalizer : ILocalizer, IDataLocalizer
	{
		public String Localize(String locale, String content, Boolean replaceNewLine = true)
		{
			return content;
		}

		String IDataLocalizer.Localize(String content)
		{
			return content;
		}
	}
}

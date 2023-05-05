// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;

namespace A2v10.Infrastructure
{
	public abstract class BaseLocalizer : ILocalizer
	{
		protected abstract IDictionary<String, String> GetLocalizerDictionary(String locale);

		protected readonly IUserLocale _userLocale;

		public BaseLocalizer(IUserLocale userLocale)
		{
			_userLocale = userLocale;
		}

		String GetLocalizedValue(String locale, String key)
		{
			if (locale == null)
			{
				locale = _userLocale.Locale;
				locale ??= Thread.CurrentThread.CurrentUICulture.Name;
			}
			var dict = GetLocalizerDictionary(locale);
			if (dict.TryGetValue(key, out String value))
				return value;
			return key;
		}

		public String Localize(String locale, String content, Boolean replaceNewLine = true)
		{
			if (content == null)
				return null;
			String s = content;
			if (replaceNewLine)
				s = content.Replace("\\n", "\n");
			var sb = new StringBuilder();
			Int32 xpos = 0;
			String key;
			do
			{
				Int32 start = s.IndexOf("@[", xpos);
				if (start == -1)
					break;
				Int32 end = s.IndexOf("]", start + 2);
				if (end == -1)
				{
					break;
				}
				else
				{
					key = "@" + s.Substring(start + 2, end - start - 2);
				}

				var value = GetLocalizedValue(locale, key);
				sb.Append(s.Substring(xpos, start - xpos));
				sb.Append(value);
				xpos = end + 1;
			} while (true);
			// tail!
			sb.Append(s.Substring(xpos));
			return sb.ToString();
		}
	}
}

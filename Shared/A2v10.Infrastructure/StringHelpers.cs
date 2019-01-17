// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Text;

namespace A2v10.Infrastructure
{
	public static class StringHelpers
	{
		public static String AppendDot(this String This, String append)
		{
			if (String.IsNullOrEmpty(This))
				return append;
			return This + '.' + append;
		}

		public static String ToPascalCase(this String s)
		{
			if (String.IsNullOrEmpty(s))
				return null;
			var b = new StringBuilder(s);
			Boolean bFirst = true;
			for (var i = 0; i < s.Length; i++)
			{
				Char ch = b[i];
				if (bFirst)
				{
					if (Char.IsLower(ch))
						b[i] = Char.ToUpper(ch);
					bFirst = false;
				}
				else if (ch == '.')
					bFirst = true;
			}
			return b.ToString();
		}

		public static String ToKebabCase(this String s, String delim = "-")
		{
			if (String.IsNullOrEmpty(s))
				return null;
			var b = new StringBuilder(s.Length + 5);
			for (var i = 0; i < s.Length; i++)
			{
				Char ch = s[i];
				if (Char.IsUpper(ch) && (i > 0))
				{
					b.Append(delim);
					b.Append(Char.ToLowerInvariant(ch));
				}
				else
				{
					b.Append(Char.ToLowerInvariant(ch));
				}
			}
			return b.ToString();
		}

		public static String EncodeJs(this String s)
		{
			if (String.IsNullOrEmpty(s))
				return null;
			return s.Replace("'", "\\'").Replace("\"", "\\\"");
		}

		public static StringBuilder RemoveTailComma(this StringBuilder sb)
		{
			if (sb.Length < 1)
				return sb;
			Int32 len = sb.Length;
			if (sb[len - 1] == ',')
				sb.Remove(len - 1, 1);
			return sb;
		}
	}
}

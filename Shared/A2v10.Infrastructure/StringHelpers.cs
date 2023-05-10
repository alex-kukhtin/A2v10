// Copyright © 2015-2023 Oleksandr Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.Text;
using System.Text.RegularExpressions;

namespace A2v10.Infrastructure;

public static class StringHelpers
{
	public static String AppendDot(this String This, String append)
	{
		if (String.IsNullOrEmpty(This))
			return append;
		return This + '.' + append;
	}

	public static String ToCamelCase(this String s)
	{
		if (String.IsNullOrEmpty(s))
			return null;
		var b = new StringBuilder(s);
		Char ch = b[0];
		if (Char.IsUpper(ch))
			b[0] = Char.ToLowerInvariant(ch);
		return b.ToString();
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
					b[i] = Char.ToUpperInvariant(ch);
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
		var sb = new StringBuilder();
		for (Int32 i = 0; i<s.Length; i++)
		{
			var ch = s[i];
			switch (ch) {
				case '\'':
				case '"':
				case '\r':
				case '\n':
					sb.Append('\\').Append(ch);
					break;
				default:
					sb.Append(ch);
					break;
			}
		}
		return sb.ToString();
	}

	public static StringBuilder TrimRight(this StringBuilder sb)
	{
		// TODO: test it
		if (sb.Length == 0)
			return sb;
		int cnt = 0;
		for (int i=sb.Length - 1; i>=0; --i)
		{
			if (sb[i] == ' ')
				cnt++;
		}
		sb.Remove(sb.Length - cnt, cnt);
		return sb;
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

	public static String ResolveMacros(this String source, ExpandoObject macros)
	{
		if (source == null)
			return null;
		var r = new Regex("\\$\\((.+?)\\)");
		var ms = r.Matches(source);
		if (ms.Count == 0)
			return source;
		var sb = new StringBuilder(source);
		foreach (Match m in ms)
		{
			String key = m.Groups[1].Value;
			String val = macros.Get<String>(key);
			sb.Replace(m.Value, val);
		}
		return sb.ToString();
	}

	public static String TemplateExpression(this String source)
	{
		if (String.IsNullOrEmpty(source))
			return null;
		var tx = source.Trim();
		if (tx.StartsWith("{{") && tx.EndsWith("}}"))
			return tx.Substring(2, tx.Length - 4).Trim();
		return null;
	}

}

// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;

namespace A2v10.Infrastructure
{
	public static class CollectionHelpers
	{
		public static IDictionary<TKey, TValue> Append<TKey, TValue>(this IDictionary<TKey, TValue> dst, IDictionary<TKey, TValue> src, Boolean replaceExisiting = false)
		{
			if (src == null)
				return dst;
			foreach (var c in src)
			{
				if (!dst.ContainsKey(c.Key))
					dst.Add(c.Key, c.Value);
				if (replaceExisiting)
					dst[c.Key] = c.Value;
			}
			return dst;
		}
	}
}

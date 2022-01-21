// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;

namespace A2v10.Xaml
{
	internal static class AttachedHelpers
	{
		internal static void SetAttached<T>(IDictionary<Object, T> dict, Object obj, T val)
		{
			if (dict.ContainsKey(obj))
				dict[obj] = val;
			else
				dict.Add(obj, val);
		}

		internal static T GetAttached<T>(IDictionary<Object, T> dict, Object obj)
		{
			if (dict == null)
				return default;
			if (dict.TryGetValue(obj, out T val))
				return val;
			return default;
		}
	}
}

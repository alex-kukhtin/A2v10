// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;

namespace A2v10.Xaml
{
	internal static class AttachedHelpers
	{
		internal static void SetAttached<T>(Lazy<IDictionary<Object, T>> dict, Object obj, T val)
		{
			if (dict.Value.ContainsKey(obj))
				dict.Value[obj] = val;
			else
				dict.Value.Add(obj, val);
		}
		internal static T GetAttached<T>(Lazy<IDictionary<Object, T>> dict, Object obj)
		{
			if (!dict.IsValueCreated)
				return default(T);
			T val;
			if (dict.Value.TryGetValue(obj, out val))
				return val;
			return default(T);
		}

		internal static void RemoveAttached<T>(Lazy<IDictionary<Object, T>> dict, Object obj)
		{
			if (!dict.IsValueCreated)
				return;
			dict.Value.Remove(obj);
		}

		internal static void CheckParentAttached<T>(Lazy<IDictionary<Object, T>> dict, Type checkType)
		{
			if (!dict.IsValueCreated)
				return;
			foreach (var elem in dict.Value)
			{
				var xe = (elem.Key as XamlElement);
				if (xe.Parent.GetType() != checkType)
					throw new XamlException($"Invalid Parent type for '{elem.Key.GetType().Name}'. Actual: '{xe.Parent.GetType().Name}'. Expected: {checkType.Name}");
			}
		}
	}
}

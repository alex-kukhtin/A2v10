// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Reflection;

namespace A2v10.Xaml
{

	public class Style : List<Setter>
	{
		public void Set(XamlElement elem)
		{
			var props = elem.GetType().GetProperties(BindingFlags.Public | BindingFlags.Instance);
			var d = new Dictionary<String, PropertyInfo>();
			foreach (var prop in props)
			{
				d.Add(prop.Name, prop);
			}
			foreach (var setter in this)
			{
				setter.SetProperty(elem, d);
			}
		}
	}
}

// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Reflection;

using A2v10.Infrastructure;

namespace A2v10.Xaml
{
	public class Setter : XamlElement
	{
		public String Property { get; set; }
		public Object Value { get; set; }

		public void SetProperty(XamlElement elem, IDictionary<String, PropertyInfo> props)
		{
			if (!props.TryGetValue(Property, out PropertyInfo prop))
				throw new XamlException($"The property '{Property}' not found in '{elem.GetType().Name}'");
			var valBind = GetBinding(nameof(Value));
			if (valBind != null)
			{
				elem.SetBinding(Property, valBind);
				return;
			}
			if (Value == null)
				return;
			if (prop.PropertyType.IsEnum)
			{
				var converter = TypeDescriptor.GetConverter(prop.PropertyType);
				var enumVal = converter.ConvertFromString(Value.ToString());
				prop.SetValue(elem, enumVal);
			}
			else
			{
				var propType = prop.PropertyType;
				if (propType.IsNullableType())
				{
					propType = Nullable.GetUnderlyingType(propType);
				}
				var val = Convert.ChangeType(Value, propType);
				prop.SetValue(elem, val);
			}
		}
	}
}

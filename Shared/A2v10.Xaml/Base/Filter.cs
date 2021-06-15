// Copyright © 2021 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Globalization;

namespace A2v10.Xaml
{
	public enum Filter
	{
		None,
		Trim,
		Upper,
		Lower,
		Barcode
	}

	[TypeConverter(typeof(FilterColllectionConverter))]
	public class FilterCollection : List<Filter>
	{
	}

	public class FilterColllectionConverter : TypeConverter
	{
		public override Boolean CanConvertFrom(ITypeDescriptorContext context, Type sourceType)
		{
			if (sourceType == typeof(String))
				return true;
			return false;
		}

		public override Object ConvertFrom(ITypeDescriptorContext context, CultureInfo culture, Object value)
		{
			if (value == null)
				return null;
			if (value is String)
			{
				var r = new FilterCollection();
				var vals = value.ToString().Split(',');
				foreach (var v in vals)
				{
					if (Enum.TryParse<Filter>(v.Trim(), out Filter filter))
						r.Add(filter);
					else
						throw new XamlException($"Invalid filter value '{v}'");
				}
				return r;
			}
			throw new XamlException($"Invalid FilterCollection value '{value}'");
		}
	}
}

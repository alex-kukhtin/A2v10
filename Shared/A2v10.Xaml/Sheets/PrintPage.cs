// Copyright © 2020 Alex Kukhtin. All rights reserved.

using System;
using System.ComponentModel;
using System.Globalization;
using System.Text;
using A2v10.Infrastructure;

namespace A2v10.Xaml
{
	[TypeConverter(typeof(ZoomConverter))]
	public class ZoomValue
	{
		public Boolean Auto { get; set; }
		public Double Value { get; set; }

		public override string ToString()
		{
			return Auto ? "auto" : Value.ToString(CultureInfo.InvariantCulture);
		}
	}

	public class PrintPage
	{
		public PageOrientation Orientation { get; set; }
		public Thickness Margin { get; set; }
		public ZoomValue Zoom { get; set; }

		public String ToJson()
		{
			var sb = new StringBuilder("{");
			sb.Append($"orientation:'{Orientation.ToString().ToLowerInvariant()}',");
			if (Margin != null)
				sb.Append($"margin: '{Margin.ToString()}',");
			if (Zoom != null)
				sb.Append($"zoom: '{Zoom.ToString()}',");
			sb.RemoveTailComma();
			sb.Append("}");
			return sb.ToString();
		}
	}

	public class ZoomConverter : TypeConverter
	{
		public override Boolean CanConvertFrom(ITypeDescriptorContext context, Type sourceType)
		{
			if (sourceType == typeof(String))
				return true;
			else if (sourceType == typeof(ZoomValue))
				return true;
			return false;
		}

		public override Object ConvertFrom(ITypeDescriptorContext context, CultureInfo culture, Object value)
		{
			if (value == null)
				return null;
			if (value is String)
			{
				String strVal = value.ToString().Trim();
				var z = new ZoomValue();
				if (strVal == "Auto")
				{
					z.Auto = true;
					return z;
				}
				else if (strVal.EndsWith("%"))
				{
					if (Double.TryParse(strVal.Substring(0, strVal.Length-1), NumberStyles.Any, CultureInfo.InvariantCulture, out Double dblVal))
					{
						z.Value = dblVal / 100.0;
						return z;
					}
				}
				else
				{
					if (Double.TryParse(strVal, NumberStyles.Any, CultureInfo.InvariantCulture, out Double dblVal))
					{
						z.Value = dblVal;
						return z;
					}
				}
			}
			throw new XamlException($"Invalid zoom value '{value}'");
		}
	}
}


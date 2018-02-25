// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.ComponentModel;
using System.Globalization;

namespace A2v10.Xaml
{

	[TypeConverter(typeof(SizeConverter))]
	public class Size
	{
		public Length Width { get; set; }
		public Length Height { get; set; }

		public Boolean IsEmpty => Width.IsEmpty && Height.IsEmpty;

		public static Size FromString(String str)
		{
			if (String.IsNullOrEmpty(str))
				return null;
			var t = new Size();
			var elems = str.Split(',');
			if (elems.Length == 1)
			{
				t.Width = Length.FromString(elems[0]);
				t.Height = t.Width;
			}
			else if (elems.Length == 2)
			{
				t.Width = Length.FromString(elems[0]);
				t.Height = Length.FromString(elems[1]);
			}
			else
			{
				throw new XamlException($"Invalid Size value '{str}'");
			}
			return t;
		}
	}

	public class SizeConverter : TypeConverter
	{
		public override Boolean CanConvertFrom(ITypeDescriptorContext context, Type sourceType)
		{
			if (sourceType == typeof(String))
				return true;
			else if (sourceType == typeof(Size))
				return true;
			return false;
		}

		public override Object ConvertFrom(ITypeDescriptorContext context, CultureInfo culture, Object value)
		{
			if (value == null)
				return null;
			if (value is String)
			{
				String strVal = value.ToString();
				return Size.FromString(strVal);
			}
			throw new XamlException($"Invalid Size value '{value}'");
		}
	}
}

// Copyright © 2018 Alex Kukhtin. All rights reserved.

using System;
using System.ComponentModel;
using System.Globalization;

namespace A2v10.Xaml.Drawing
{
	[TypeConverter(typeof(SizeConverter))]
	public class Size
	{
		public Int32 Width { get; set; }
		public Int32 Height { get; set; }

		public Size()
		{
		}

		public Size(String str)
		{
			var arr = str.Split(',');
			if (arr.Length > 1)
			{
				Width = Int32.Parse(arr[0]);
				Height = Int32.Parse(arr[1]);
			} else
			{
				throw new XamlException($"Invalid point value '{str}'");
			}
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
			return base.CanConvertFrom(context, sourceType);
		}

		public override Object ConvertFrom(ITypeDescriptorContext context, CultureInfo culture, Object value)
		{
			if (value == null)
				return null;
			if (value is String)
			{
				return new Size(value.ToString());
			}
			else if (value is Size)
			{
				return value;
			}
			return base.ConvertFrom(context, culture, value);
		}
	}
}

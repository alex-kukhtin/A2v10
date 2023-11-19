// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.ComponentModel;
using System.Globalization;

namespace A2v10.Xaml
{

	[TypeConverter(typeof(GapSizeConverter))]
	public class GapSize
	{
		public Length Vert { get; set; }
		public Length Horz { get; set; }

		public Boolean IsEmpty => Vert.IsEmpty && Horz.IsEmpty;

		public static GapSize FromString(String str)
		{
			if (String.IsNullOrEmpty(str))
				return null;
			var t = new GapSize();
			var elems = str.Split(',');
			if (elems.Length == 1)
			{
				t.Vert = Length.FromString(elems[0]);
				t.Horz = t.Vert;
			}
			else if (elems.Length == 2)
			{
				t.Vert = Length.FromString(elems[0]);
				t.Horz = Length.FromString(elems[1]);
			}
			else
			{
				throw new XamlException($"Invalid Gap value '{str}'");
			}
			return t;
		}

		public override String ToString()
		{
			if (Vert == null && Horz == null)
				return null;
			if (Vert == Horz)
				return Vert.ToString();
			else
				return $"{Vert} {Horz}";
		}
	}

	public class GapSizeConverter : TypeConverter
	{
		public override Boolean CanConvertFrom(ITypeDescriptorContext context, Type sourceType)
		{
			if (sourceType == typeof(String))
				return true;
			else if (sourceType == typeof(GapSize))
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
				return GapSize.FromString(strVal);
			}
			throw new XamlException($"Invalid Gap value '{value}'");
		}
	}
}

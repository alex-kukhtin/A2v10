// Copyright © 2020-2023 Oleksandr Kukhtin. All rights reserved.

using System;
using System.ComponentModel;
using System.Globalization;

namespace A2v10.Xaml
{
	public enum SheetAutoGenerateMode
	{
		FromDataModel,
		FromReportInfo
	}

	[TypeConverter(typeof(SheetAutoGenerateConverter))]
	public class SheetAutoGenerate
	{
		public String PropertyName { get; set; }
		public SheetAutoGenerateMode Mode { get; set; }

		public static SheetAutoGenerate FromString(String str)
		{
			return new SheetAutoGenerate()
			{
				Mode = SheetAutoGenerateMode.FromDataModel,
				PropertyName = str
			};
		}
	}

	public class SheetAutoGenerateConverter : TypeConverter
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
				String strVal = value.ToString();
				return SheetAutoGenerate.FromString(strVal);
			}
			throw new XamlException($"Invalid  SheetAutoGenerate '{value}'");
		}
	}
}

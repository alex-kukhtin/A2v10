// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.ComponentModel;
using System.Globalization;
using System.Collections.Generic;

namespace A2v10.Xaml
{
	[TypeConverter(typeof(UICollectionConverter))]
	public class UIElementCollection : List<UIElementBase>
	{
		public UIElementCollection()
		{

		}
	}

	public class UICollectionConverter : TypeConverter
	{
		public override bool CanConvertFrom(ITypeDescriptorContext context, Type sourceType)
		{
			if (sourceType == typeof(String))
				return true;
			else if (sourceType == typeof(UIElementBase))
				return true;
			return base.CanConvertFrom(context, sourceType);
		}

		public override object ConvertFrom(ITypeDescriptorContext context, CultureInfo culture, object value)
		{
			if (value == null)
				return null;
			if (value is String)
			{
				var x = new UIElementCollection();
				x.Add(new Span() { Content = value });
				return x;
			}
			else if (value is UIElementBase)
			{
				var x = new UIElementCollection();
				x.Add(value as UIElementBase);
				return x;
			}
			return base.ConvertFrom(context, culture, value);
		}
	}
}

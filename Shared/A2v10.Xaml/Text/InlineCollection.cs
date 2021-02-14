// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Globalization;

namespace A2v10.Xaml
{
	[TypeConverter(typeof(InlineCollectionConverter))]
	public sealed class InlineCollection : List<Object>
	{
		internal void Render(RenderContext context)
		{
			foreach (var x in this)
			{
				if (x == null)
					continue;
				if (x is String)
					context.Writer.Write(context.LocalizeCheckApostrophe(x.ToString()));
				else if (x is Inline)
					(x as Inline).RenderElement(context);
				else
					throw new XamlException($"Invalid inline element '{x.GetType().ToString()}'");
			}
		}
	}

	public class InlineCollectionConverter : TypeConverter
	{
		public override Boolean CanConvertFrom(ITypeDescriptorContext context, Type sourceType)
		{
			if (sourceType == typeof(String))
				return true;
			else if (sourceType == typeof(InlineCollection))
				return true;
			return base.CanConvertFrom(context, sourceType);
		}

		public override Object ConvertFrom(ITypeDescriptorContext context, CultureInfo culture, Object value)
		{
			if (value == null)
				return null;
			if (value is String)
			{
				var x = new InlineCollection
				{
					value
				};
				return x;
			}
			else if (value is InlineCollection)
			{
				return value;
			}
			return base.ConvertFrom(context, culture, value);
		}
	}

}

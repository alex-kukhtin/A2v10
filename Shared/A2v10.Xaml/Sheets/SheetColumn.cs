// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Globalization;

namespace A2v10.Xaml
{
	public class SheetColumn : XamlElement
	{
		public Boolean Fit { get; set; }
		public Length Width { get; set; }

		public SheetColumn()
		{

		}

		public SheetColumn(String definition)
		{
			if (definition == "Fit")
				Fit = true;
			else
				Width = Length.FromString(definition);
		}

		internal void Render(RenderContext context)
		{
			var col = new TagBuilder("col");
			if (Fit)
				col.AddCssClass("fit");
			if (Width != null)
				col.MergeStyle("width", Width.Value);
			col.Render(context, TagRenderMode.SelfClosing);
		}
	}

	[TypeConverter(typeof(SheetColumnCollectionConverter))]
	public class SheetColumnCollection : List<SheetColumn>
	{
		internal void Render(RenderContext context)
		{
			var cols = new TagBuilder("colgroup");
			cols.RenderStart(context);
			foreach (var col in this)
				col.Render(context);
			cols.RenderEnd(context);
		}
	}

	public class SheetColumnCollectionConverter : TypeConverter
	{
		public override bool CanConvertFrom(ITypeDescriptorContext context, Type sourceType)
		{
			if (sourceType == typeof(String))
				return true;
			else if (sourceType == typeof(SheetColumnCollection))
				return true;
			return false;
		}

		public override object ConvertFrom(ITypeDescriptorContext context, CultureInfo culture, object value)
		{
			if (value == null)
				return null;
			else if (value is SheetColumnCollection)
				return value;
			if (value is String)
			{
				var vals = value.ToString().Split(',');
				var coll = new SheetColumnCollection();
				foreach (var val in vals)
				{
					coll.Add(new SheetColumn(val.Trim()));
				}
				return coll;
			}
			throw new XamlException($"Invalid value '{value}'");
		}
	}
}

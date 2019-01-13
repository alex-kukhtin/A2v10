// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using A2v10.Infrastructure;
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
		public ColumnBackgroundStyle Background { get; set; }

		public SheetColumn()
		{

		}

		public SheetColumn(String definition)
		{
			var len = definition.Length;
			if (definition.IndexOf('+') == len - 2) {
				var color = definition[len - 1];
				switch (color) {
					case 'Y': Background = ColumnBackgroundStyle.Yellow; break;
					case 'B': Background = ColumnBackgroundStyle.Blue; break;
					case 'G': Background = ColumnBackgroundStyle.Green; break;
					case 'R': Background = ColumnBackgroundStyle.Red; break;
					case 'A': Background = ColumnBackgroundStyle.Gray; break;
					default: throw new XamlException($"Invalid BackgroundColor for SheetColumn ('{color}')");
				}
				definition = definition.Substring(0, len - 2);
			}
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
			if (Background != ColumnBackgroundStyle.None)
				col.AddCssClass(Background.ToString().ToKebabCase());

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
		public override Boolean CanConvertFrom(ITypeDescriptorContext context, Type sourceType)
		{
			if (sourceType == typeof(String))
				return true;
			else if (sourceType == typeof(SheetColumnCollection))
				return true;
			return false;
		}

		public override Object ConvertFrom(ITypeDescriptorContext context, CultureInfo culture, Object value)
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

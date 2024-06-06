// Copyright © 2015-2024 Oleksandr Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Globalization;

using A2v10.Infrastructure;

namespace A2v10.Xaml;

public class TableColumn : XamlElement
{
	public Boolean Fit { get; set; }
	public Length Width { get; set; }
	public Length MinWidth { get; set; }
	public ColumnBackgroundStyle Background { get; set; }
	public Boolean? If { get; set; }
	public Object ItemsSource { get; set; }

	public TableColumn()
	{

	}

	public TableColumn(String definition)
	{
		if (definition == "Fit")
			Fit = true;
		else
			Width = Length.FromString(definition);
	}

	internal void Render(RenderContext context)
	{
		var col = new TagBuilder("col");

		Bind isBind = GetBinding(nameof(ItemsSource));
		if (isBind != null)
		{
			col.MergeAttribute("v-for", $"(col, colIndex) in {isBind.GetPath(context)}");
			col.MergeAttribute(":key", "colIndex");
			using var scope = new ScopeContext(context, "col", isBind.Path);
			RenderColumn(col, context);
		}
		else
		{
			RenderColumn(col, context);
		}
	}

	internal void RenderColumn(TagBuilder col, RenderContext context)
	{
		if (Fit)
			col.AddCssClass("fit");
		if (Width != null)
			col.MergeStyle("width", Width.Value);
		if (MinWidth != null)
			col.MergeStyle("min-width", MinWidth.Value);
		MergeBindingAttributeBool(col, context, "v-if", nameof(If), If);
		if (Background != ColumnBackgroundStyle.None)
			col.AddCssClass(Background.ToString().ToKebabCase());
		col.Render(context, TagRenderMode.SelfClosing);
	}
}

[TypeConverter(typeof(TableColumnCollectionConverter))]
public class TableColumnCollection : List<TableColumn>
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

public class TableColumnCollectionConverter : TypeConverter
{
	public override Boolean CanConvertFrom(ITypeDescriptorContext context, Type sourceType)
	{
		if (sourceType == typeof(String))
			return true;
		else if (sourceType == typeof(TableColumnCollection))
			return true;
		return false;
	}

	public override Object ConvertFrom(ITypeDescriptorContext context, CultureInfo culture, Object value)
	{
		if (value == null)
			return null;
		else if (value is TableColumnCollection)
			return value;
		if (value is String)
		{
			var vals = value.ToString().Split(',');
			var coll = new TableColumnCollection();
			foreach (var val in vals)
			{
				coll.Add(new TableColumn(val.Trim()));
			}
			return coll;
		}
		throw new XamlException($"Invalid value '{value}'");
	}
}

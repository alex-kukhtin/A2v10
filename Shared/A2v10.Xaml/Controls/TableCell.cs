// Copyright © 2015-2022 Alex Kukhtin. All rights reserved.

using A2v10.Infrastructure;
using System;
using System.Text;

namespace A2v10.Xaml;

public class TableCellCollection : UIElementCollection
{

}

public class TableCell : UiContentElement
{
	public Int32? ColSpan { get; set; }
	public Int32? RowSpan { get; set; }
	public VerticalAlign VAlign { get; set; }
	public TextAlign Align { get; set; }
	public Boolean? Bold { get; set; }
	public Boolean? Italic { get; set; }
	public Boolean Gray { get; set; }
	public String CssClass { get; set; }

	public Boolean? FirstInRow { get; set; }

	//public Boolean Validate { get; set; }

	public Object ItemsSource { get; set; }

	public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
	{
		if (SkipRender(context))
			return;
		var td = new TagBuilder("td");
		onRender?.Invoke(td);
		if (FirstInRow.HasValue && !FirstInRow.Value)
			td.AddCssClass("no-first");

		td.AddCssClass(CssClass);

		Bind isBind = GetBinding(nameof(ItemsSource));
		if (isBind != null)
		{
			td.MergeAttribute("v-for", $"(cell, cellIndex) in {isBind.GetPath(context)}");
			td.MergeAttribute(":key", "cellIndex");
			using (var scope = new ScopeContext(context, "cell", isBind.Path))
			{
				RenderCell(td, context);
			}
		}
		else
		{
			RenderCell(td, context);
		}
	}

	void RenderCell(TagBuilder td, RenderContext context)
	{ 
		MergeAttributes(td, context);

		var boldBind = GetBinding(nameof(Bold));
		var italicBind = GetBinding(nameof(Italic));
		if (boldBind != null || italicBind != null)
		{
			var sb = new StringBuilder("{");
			if (boldBind != null)
				sb.Append($"bold: {boldBind.GetPath(context)}, ");
			if (italicBind != null)
				sb.Append($"italic: {italicBind.GetPath(context)}, ");
			sb.RemoveTailComma();
			sb.Append("}");
			td.MergeAttribute(":class", sb.ToString());
		}
		td.AddCssClassBoolNo(Bold, "bold");
		td.AddCssClassBoolNo(Italic, "italic");
		td.AddCssClassBool(Gray, "gray");


		if (Align != TextAlign.Left)
			td.AddCssClass("text-" + Align.ToString().ToLowerInvariant());

		if (VAlign != VerticalAlign.Default)
			td.AddCssClass($"valign-{VAlign.ToString().ToLowerInvariant()}");

		if (Content is ITableControl)
			td.AddCssClass("ctrl");

		MergeContent(td, context);

		var colSpanBind = GetBinding(nameof(ColSpan));
		if (colSpanBind != null)
			td.MergeAttribute(":colspan", colSpanBind.GetPath(context));
		else
			MergeAttributeInt32(td, context, nameof(ColSpan), "colspan", ColSpan);
		var rowSpanBind = GetBinding(nameof(RowSpan));
		if (rowSpanBind != null)
			td.MergeAttribute(":rowspan", rowSpanBind.GetPath(context));
		else
			MergeAttributeInt32(td, context, nameof(RowSpan), "rowspan", RowSpan);

		td.RenderStart(context);
		RenderContent(context);
		/*
             * no use, the content in the attribute
            if (Validate)
            {
                var val = new TagBuilder("validator-control");
                val.MergeAttribute(":item", "row");
                val.MergeAttribute("prop", "Sum");
                val.Render(context);
            }*/
		td.RenderEnd(context);
	}
}

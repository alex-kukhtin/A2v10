// Copyright © 2015-2022 Alex Kukhtin. All rights reserved.

using A2v10.Infrastructure;
using System;
using System.Collections.Generic;
using System.Text;
using System.Windows.Markup;

namespace A2v10.Xaml;

public class TreeGridCellCollection : List<TreeGridCell>
{

}

[ContentProperty("Content")]
public class TreeGridCell : UiContentElement
{
	public Boolean? Bold { get; set; }
	public Boolean? Italic { get; set; }
	public Boolean Gray { get; set; }

	public VerticalAlign VAlign { get; set; }
	public TextAlign Align { get; set; }

	public Boolean ShowButton { get; set; }

	public Length Width { get; set; }


	public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
	{
		throw new NotImplementedException();
	}

	public void RenderCell(String tagName, RenderContext context, Action<TagBuilder> onRender = null)
	{
		if (SkipRender(context))
			return;
		var td = new TagBuilder(tagName);
		onRender?.Invoke(td);
		RenderCell(td, context);
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

		if (Width != null)
			td.MergeStyle("width", Width.Value);

		if (Align != TextAlign.Left)
			td.AddCssClass("text-" + Align.ToString().ToLowerInvariant());

		if (VAlign != VerticalAlign.Default)
			td.AddCssClass($"valign-{VAlign.ToString().ToLowerInvariant()}");

		if (Content is ITableControl)
			td.AddCssClass("ctrl");

		if (ShowButton)
			td.AddCssClass("indent");
		else
			MergeContent(td, context);

		td.RenderStart(context);
		if (ShowButton)
		{
			var outTag = new TagBuilder("span", "overlay");
			outTag.RenderStart(context);
			var markTag = new TagBuilder("span", "mark");
			markTag.RenderStart(context);
			var btn = new TagBuilder("a", "toggle");
			btn.MergeAttribute("href", "");
			btn.MergeAttribute("v-if", "row.that.hasChildren(row.itm)");
			btn.MergeAttribute("@click.stop.prevent", "row.that.toggle(row.itm)");
			btn.MergeAttribute(":class", "row.that.toggleClass(row.itm)");
			btn.Render(context);
			markTag.RenderEnd(context);
			var span = new TagBuilder("span", "toggle-content");
			MergeContent(span, context);
			span.RenderStart(context);
			RenderContent(context);
			span.RenderEnd(context);
			outTag.RenderEnd(context);
		}
		else
		{
			RenderContent(context);
		}
		td.RenderEnd(context);
	}
}

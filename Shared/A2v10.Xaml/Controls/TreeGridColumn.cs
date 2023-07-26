// Copyright © 2015-2023 Oleksandr Kukhtin. All rights reserved.

using A2v10.Infrastructure;
using System;
using System.Collections.Generic;
using System.Text;
using System.Windows.Markup;

namespace A2v10.Xaml;

public class TreeGridColumnCollection : List<TreeGridColumn>
{

}

[ContentProperty("Content")]
public class TreeGridColumn : UiContentElement
{
	public Boolean? Bold { get; set; }
	public Boolean? Italic { get; set; }
	public Boolean Gray { get; set; }

	public VerticalAlign VAlign { get; set; }
	public TextAlign Align { get; set; }
	public Boolean ShowButton { get; set; }
	public Length Width { get; set; }
	public Boolean Fit { get; set; }
	public Length MinWidth { get; set; }
	public String Header { get; set; }
	public UInt32 MaxChars { get; set; }
	public Boolean? Sort { get; set; }
	public String SortProperty { get; set; }

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

	public void AddAligns(TagBuilder td)
	{
		if (Align != TextAlign.Left)
			td.AddCssClass("text-" + Align.ToString().ToLowerInvariant());

		if (VAlign != VerticalAlign.Default)
			td.AddCssClass($"valign-{VAlign.ToString().ToLowerInvariant()}");
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

		AddAligns(td);

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

	protected override void MergeContent(TagBuilder tag, RenderContext context)
	{
		var contBind = GetBinding(nameof(Content));
		if (contBind != null)
		{
			tag.MergeAttribute("v-text", MaxChars > 0 ? $"$maxChars({contBind.GetPathFormat(context)}, {MaxChars})" : contBind.GetPathFormat(context));
			if (contBind.NegativeRed)
				tag.MergeAttribute(":class", $"$getNegativeRedClass({contBind.GetPath(context)})");
		}
	}

	public void RenderColumn(String tagName, RenderContext context, Boolean sort, Action<TagBuilder> onRender = null)
	{
		if (SkipRender(context))
			return;
		var td = new TagBuilder(tagName);
		onRender?.Invoke(td);
		AddAligns(td);
		MergeAttributes(td, context, MergeAttrMode.Wrap | MergeAttrMode.Visibility);
		if (Fit)
			td.AddCssClass("fit");
		else if (Width != null)
			td.MergeStyle("width", Width.Value);
		if (Align != TextAlign.Left)
			td.AddCssClass("text-" + Align.ToString().ToLowerInvariant());

		Boolean canSort = sort && (Sort == null || Sort.Value);
		if (canSort)
		{
			var prop = SortProperty;
			if (String.IsNullOrEmpty(prop))
				prop = GetBinding(nameof(Content))?.Path;
			if (!String.IsNullOrEmpty(prop)) 
			{ 
				td.AddCssClass("sortable");
				td.MergeAttribute(":class", $"hdr.that.headerClass('{prop}')");
				td.MergeAttribute("@click.stop.prevent", $"hdr.that.doSort('{prop}')");
			}
		}

		td.RenderStart(context);
		var span = new TagBuilder(null, "h-holder");
		span.RenderStart(context);
		if (Header != null)
			context.Writer.Write(context.LocalizeCheckApostrophe(Header.Replace("\\n", "<br>")));
		span.RenderEnd(context);
		td.RenderEnd(context);
	}

	public void RenderColumnTag(RenderContext context)
	{
		var col = new TagBuilder("col");
		MergeAttributes(col, context, MergeAttrMode.Visibility);
		var hd = GetBinding(nameof(Content));
		if (hd != null)
			col.MergeAttribute(":class", $"cols.that.columnClass('{hd.Path}', {Fit.ToString().ToLowerInvariant()})");
		if (MinWidth != null)
			col.MergeStyle("min-width", MinWidth.Value);
		col.Render(context);
	}
}

// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;

namespace A2v10.Xaml
{
	public class SheetCell : UiContentElement, ISheetCell
	{
		public Int32? ColSpan { get; set; }
		public Int32? RowSpan { get; set; }
		public TextAlign? Align { get; set; }
		public Boolean? Bold { get; set; }
		public Boolean? Italic { get; set; }
		public VerticalAlign VAlign { get; set; }
		public Boolean Underline { get; set; }
		public Boolean Vertical { get; set; }

		public Boolean GroupIndent { get; set; } // ???

		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var td = new TagBuilder("td");
			MergeAttributes(td, context);

			var colSpanBind = GetBinding(nameof(ColSpan));
			if (colSpanBind != null)
				td.MergeAttribute(":colspan", colSpanBind.GetPath(context));
			else
				td.MergeAttribute("colspan", ColSpan);
			var rowSpanBind = GetBinding(nameof(RowSpan));
			if (rowSpanBind != null)
				td.MergeAttribute(":rowspan", rowSpanBind.GetPath(context));
			else
				td.MergeAttribute("rowspan", RowSpan);

			if (Align != null)
				td.AddCssClass("text-" + Align.ToString().ToLowerInvariant());
			if (VAlign != VerticalAlign.Default)
				td.AddCssClass($"valign-{VAlign.ToString().ToLowerInvariant()}");
			if (GroupIndent && IsInTreeSection)
			{
				td.MergeAttribute(":class", "row.indentCssClass()");
			}
			if (Underline)
				td.AddCssClass("underline");
			td.AddCssClassBoolNo(Bold, "bold");
			td.AddCssClassBoolNo(Italic, "italic");
			if (Vertical)
			{
				td.AddCssClass("vert");
				td.RenderStart(context);
				var div = new TagBuilder("p", "vcell");
				MergeContent(div, context);
				div.RenderStart(context);
				RenderContentVert(context, Content);
				div.RenderEnd(context);
				td.RenderEnd(context);
			}
			else
			{
				MergeContent(td, context);
				td.RenderStart(context);
				RenderContent(context);
				td.RenderEnd(context);
			}
		}

		protected void RenderContentVert(RenderContext context, Object content)
		{
			// if it's a binding, it will be added via MergeAttribute
			if (content == null)
				return;
			if (content is UIElementBase)
				(content as UIElementBase).RenderElement(context);
			else if (content != null)
			{
				context.Writer.Write(
					context.LocalizeCheckApostrophe(
						content.ToString()
						.Replace("\\n", "<br>")
						.Replace(" ", "&#xa0;")
					)
				);
			}
		}

		protected override void MergeContent(TagBuilder tag, RenderContext context)
		{
			var contBind = GetBinding(nameof(Content));
			if (contBind != null)
			{
				tag.MergeAttribute("v-text", contBind.GetPathFormat(context));
				if (contBind.DataType != DataType.String)
					tag.MergeAttribute("data-type", contBind.DataType.ToString().ToLowerInvariant());
			}
		}

		Boolean IsInTreeSection
		{
			get
			{
				if (Parent is SheetRow p)
					return p.Parent is SheetTreeSection;
				return false;
			}
		}
	}

	public class SheetCells : List<ISheetCell>
	{

	}
}

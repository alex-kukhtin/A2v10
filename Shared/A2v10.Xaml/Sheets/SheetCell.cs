// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;

namespace A2v10.Xaml
{
	public class SheetCell : UiContentElement
	{
		public Int32? ColSpan { get; set; }
		public Int32? RowSpan { get; set; }
		public TextAlign? Align { get; set; }
		public Boolean? Bold { get; set; }
		public Boolean? Italic { get; set; }

		public Boolean GroupIndent { get; set; } // ???

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var td = new TagBuilder("td");
			MergeAttributes(td, context);
			td.MergeAttribute("colspan", ColSpan);
			td.MergeAttribute("rowspan", RowSpan);
			if (Align != null)
				td.AddCssClass("text-" + Align.ToString().ToLowerInvariant());
			if (GroupIndent && IsInTreeSection)
			{
				td.MergeAttribute(":class", "row.indentCssClass()");
			}
			MergeContent(td, context);
			td.AddCssClassBoolNo(Bold, "bold");
			td.AddCssClassBoolNo(Italic, "italic");
			td.RenderStart(context);
			RenderContent(context);
			td.RenderEnd(context);
		}

		internal override void MergeContent(TagBuilder tag, RenderContext context)
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

	public class SheetCells : List<SheetCell>
	{

	}
}

// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using A2v10.Infrastructure;
using System;
using System.Text;

namespace A2v10.Xaml
{

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

		//public Boolean Validate { get; set; }

		public Object ItemsSource { get; set; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			var td = new TagBuilder("td");
			if (onRender != null)
				onRender(td);

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

			MergeContent(td, context);

			if (Align != TextAlign.Left)
				td.AddCssClass("text-" + Align.ToString().ToLowerInvariant());

			if (VAlign != VerticalAlign.Default)
				td.AddCssClass($"valign-{VAlign.ToString().ToLowerInvariant()}");

			if (Content is ITableControl)
				td.AddCssClass("ctrl");

			Bind isBind = GetBinding(nameof(ItemsSource));
			if (isBind != null)
			{
				td.MergeAttribute("v-for", $"(cell, cellIndex) in {isBind.GetPath(context)}");
				td.MergeAttribute(":key", "cellIndex");
			}
			MergeAttributeInt32(td, context, nameof(ColSpan), "colspan", ColSpan);
			MergeAttributeInt32(td, context, nameof(RowSpan), "rowspan", RowSpan);
			td.RenderStart(context);
			RenderContent(context);
			/*
             * Никакого толку, содержимое в атрибуте
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
}

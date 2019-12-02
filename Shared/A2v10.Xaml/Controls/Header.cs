// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
	public class Header : UiContentElement
	{
		public ControlSize Size { get; set; }
		public TextAlign Align { get; set; }

		public String Badge { get; set; }

		public Boolean? Bold { get; set; }

		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			String tagName = "h3";
			switch (Size)
			{
				case ControlSize.Large: tagName = "h2"; break;
				case ControlSize.Small: tagName = "h4"; break;
				case ControlSize.Mini: tagName = "h5"; break;
			}

			var h = new TagBuilder(tagName, "a2-header", IsInGrid);
			MergeAttributes(h, context);
			h.AddCssClassBoolNo(Bold, "bold");
			if (Align != TextAlign.Left)
				h.AddCssClass("text-" + Align.ToString().ToLowerInvariant());
			Boolean bHasBadge = GetBinding(nameof(Badge)) != null ||
				!String.IsNullOrEmpty(Badge);
			if (!bHasBadge)
				MergeContent(h, context);
			h.RenderStart(context);
			if (bHasBadge)
			{
				var span = new TagBuilder("span");
				MergeContent(span, context);
				span.RenderStart(context);
				RenderContent(context);
				span.RenderEnd(context);
			}
			else
			{
				RenderContent(context);
			}
			RenderBadge(context, Badge);
			h.RenderEnd(context);
		}
	}
}

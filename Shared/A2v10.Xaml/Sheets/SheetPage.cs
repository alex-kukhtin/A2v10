// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
	public class SheetPage : Container, IHasWrapper
	{
		public PageOrientation Orientation { get; set; }
		public Size PageSize { get; set; }

		public PrintPage PrintPage { get; set; }

		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			var wrap = new TagBuilder("div", "sheet-page-wrapper", IsInGrid);
			MergeAttributes(wrap, context);
			wrap.RenderStart(context);
			var page = new TagBuilder("div", "sheet-page");

			if (PrintPage != null)
			{
				page.AddCssClass(PrintPage.Orientation.ToString().ToLowerInvariant());
				page.MergeAttribute("v-print-page", PrintPage.ToJson());
			}
			else
			{
				page.AddCssClass(Orientation.ToString().ToLowerInvariant());
				page.MergeAttribute("v-page-orientation", $"'{Orientation.ToString().ToLowerInvariant()}'");
			}

			if (PageSize != null)
			{
				if (!PageSize.Width.IsEmpty)
				{
					page.MergeStyle("width", PageSize.Width.ToString());
					var pw = PageSize.Width.ToString();
					if (pw == "auto")
						pw = "none";
					page.MergeStyle("max-width", pw);
				}
				if (!PageSize.Height.IsEmpty)
				{
					page.MergeStyle("min-height", PageSize.Height.ToString());
				}
			}

			page.RenderStart(context);
			RenderChildren(context);
			page.RenderEnd(context);
			wrap.RenderEnd(context);
		}
	}
}

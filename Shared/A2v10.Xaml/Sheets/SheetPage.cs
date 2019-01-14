// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
	public class SheetPage : Container
	{
		public PageOrientation Orientation { get; set; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			var wrap = new TagBuilder("div", "sheet-page-wrapper", IsInGrid);
			MergeAttributes(wrap, context);
			wrap.RenderStart(context);
			var page = new TagBuilder("div", "sheet-page");
			page.AddCssClass(Orientation.ToString().ToLowerInvariant());
			page.MergeAttribute("v-page-orientation", $"'{Orientation.ToString().ToLowerInvariant()}'");
			page.RenderStart(context);
			RenderChildren(context);
			page.RenderEnd(context);
			wrap.RenderEnd(context);
		}
	}
}

// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
	public class Popup : RootContainer
	{
		public Length Width { get; set; }
		public Length MinWidth { get; set; }

		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var tag = new TagBuilder("div", "a2-popup");
			tag.MergeAttribute("ondblclick", "event.stopPropagation()");
			tag.MergeAttribute("id", context.RootId);
			MergeAttributes(tag, context, MergeAttrMode.Margin);
			if (Width != null)
				tag.MergeStyle("width", Width.ToString());
			if (MinWidth != null)
				tag.MergeStyle("min-width", MinWidth.ToString());
			tag.RenderStart(context);
			RenderChildren(context);
			RenderAccelCommands(context);
			tag.RenderEnd(context);
		}
	}
}

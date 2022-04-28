// Copyright © 2015-2022 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
	public class PartialBlock : RootContainer
	{
		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var page = new TagBuilder("div", "partial-block");
			page.MergeAttribute("id", context.RootId);
			MergeAttributes(page, context, MergeAttrMode.Margin);

			page.AddCssClass(CssClass);

			page.RenderStart(context);
			RenderChildren(context);
			RenderContextMenus();
			RenderAccelCommands(context);
			page.RenderEnd(context);
		}
	}
}

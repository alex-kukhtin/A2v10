// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml.Layouts
{
	public class Flex : Container
	{
		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var flex = new TagBuilder("div", "flex", IsInGrid);
			onRender?.Invoke(flex);
			MergeAttributes(flex, context);
			flex.RenderStart(context);
			RenderChildren(context);
			flex.RenderEnd(context);
		}

		internal override void RenderChildren(RenderContext context, Action<TagBuilder> onRenderStatic = null)
		{
			foreach (var ch in Children)
			{
				var wrap = new TagBuilder("div", "flex-item");
				wrap.RenderStart(context);
				ch.RenderElement(context);
				wrap.RenderEnd(context);
			}
		}
	}
}

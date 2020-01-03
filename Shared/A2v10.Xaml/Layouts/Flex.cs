// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
	public class Flex : Container
	{
		public Orientation Orientation { get; set; }

		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var flex = new TagBuilder("div", "flex", IsInGrid);
			onRender?.Invoke(flex);
			if (Orientation != Orientation.Vertical)
				flex.AddCssClass("horz");
			MergeAttributes(flex, context);
			flex.RenderStart(context);
			RenderChildren(context);
			flex.RenderEnd(context);
		}

		public override void RenderChildren(RenderContext context, Action<TagBuilder> onRenderStatic = null)
		{
			foreach (var ch in Children)
			{
				ch.RenderElement(context);
			}
		}
	}
}

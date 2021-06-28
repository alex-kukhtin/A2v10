// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

using System;

using A2v10.Infrastructure;

namespace A2v10.Xaml
{
	public class Flex : Container
	{
		public Orientation Orientation { get; set; }
		public GapSize Gap { get; set; }
		public JustifyItems JustifyItems { get; set; }

		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var flex = new TagBuilder("div", "flex", IsInGrid);
			onRender?.Invoke(flex);
			if (Orientation != Orientation.Vertical)
				flex.AddCssClass("horz");
			MergeAttributes(flex, context);
			if (Gap != null)
				flex.MergeStyle("gap", Gap.ToString());
			if (JustifyItems != JustifyItems.Default)
				flex.AddCssClass("justify-" + JustifyItems.ToString().ToKebabCase());

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

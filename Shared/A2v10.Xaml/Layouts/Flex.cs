// Copyright © 2015-2023 Oleksandr Kukhtin. All rights reserved.

using System;

using A2v10.Infrastructure;

namespace A2v10.Xaml;

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
		var isBind = GetBinding(nameof(ItemsSource));
		if (isBind != null)
		{
			var tml = new TagBuilder("template");
			onRenderStatic?.Invoke(tml);
			MergeAttributes(tml, context, MergeAttrMode.Visibility);
			tml.MergeAttribute("v-for", $"(xelem, xIndex) in {isBind.GetPath(context)}");
			tml.RenderStart(context);
			using (new ScopeContext(context, "xelem", isBind.Path))
			{
				foreach (var c in Children)
				{
					c.RenderElement(context, (tag) =>
					{
						onRenderStatic?.Invoke(tag);
						tag.MergeAttribute(":key", "xIndex");
					});
				}
			}
			tml.RenderEnd(context);
		}
		else
		{
			foreach (var ch in Children)
			{
				ch.RenderElement(context);
			}
		}
	}
}

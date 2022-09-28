// Copyright © 2015-2022 Alex Kukhtin. All rights reserved.

using System;
using A2v10.Infrastructure;

namespace A2v10.Xaml;

public class StackPanel : Container, ITableControl
{
	public Orientation Orientation { get; set; }
	public AlignItems AlignItems { get; set; }
	public JustifyItems JustifyItems { get; set; }
	public Boolean Inline { get; set; }
	public GapSize Gap { get; set; }
	public Length Height { get; set; }

	public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
	{
		if (SkipRender(context))
			return;
		var div = new TagBuilder("div", "stack-panel", IsInGrid);
		onRender?.Invoke(div);
		MergeAttributes(div, context);
		div.AddCssClass(Orientation.ToString().ToLowerInvariant());
		if (Inline)
			div.AddCssClass("inline");
		if (AlignItems != AlignItems.Default)
			div.AddCssClass("align-" + AlignItems.ToString().ToLowerInvariant());
		if (JustifyItems != JustifyItems.Default)
			div.AddCssClass("justify-" + JustifyItems.ToString().ToKebabCase());

		if (Gap != null)
			div.MergeStyle("gap", Gap.ToString());
		if (Height != null)
			div.MergeStyle("height", Height.Value);

		div.RenderStart(context);
		RenderChildren(context);
		div.RenderEnd(context);
	}
}

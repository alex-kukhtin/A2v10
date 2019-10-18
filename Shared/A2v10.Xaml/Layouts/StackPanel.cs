// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{

	public class StackPanel : Container, ITableControl
	{
		public Orientation Orientation { get; set; }
		public AlignItems AlignItems { get; set; }

		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var div = new TagBuilder("div", "stack-panel", IsInGrid);
			onRender?.Invoke(div);
			MergeAttributes(div, context);
			div.AddCssClass(Orientation.ToString().ToLowerInvariant());
			if (AlignItems != AlignItems.Default)
				div.AddCssClass("align-" + AlignItems.ToString().ToLowerInvariant());
			div.RenderStart(context);
			RenderChildren(context);
			div.RenderEnd(context);
		}
	}
}

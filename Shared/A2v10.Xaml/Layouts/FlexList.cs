// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using A2v10.Infrastructure;
using System;

namespace A2v10.Xaml
{
	public enum BorderStyle
	{
		None,
		Top,
		TopBottom,
		All
	}

	public class FlexList : Container, ITableControl
	{
		public Orientation Orientation { get; set; }

		public BorderStyle BorderStyle { get; set; }
		public AlignItems AlignItems { get; set; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var list = new TagBuilder("ul", "flex-list", IsInGrid);
			MergeAttributes(list, context);
			if (AlignItems != AlignItems.Default)
				list.AddCssClass("align-" + AlignItems.ToString().ToLowerInvariant());
			list.AddCssClass(Orientation.ToString().ToLowerInvariant());
			if (BorderStyle != BorderStyle.None)
				list.AddCssClass($"border-{BorderStyle.ToString().ToKebabCase()}");
			list.RenderStart(context);
			RenderChildren(context);
			list.RenderEnd(context);
		}

		internal override void RenderChildren(RenderContext context, Action<TagBuilder> onRenderStatic = null)
		{
			foreach (var c in Children)
			{
				var tag = new TagBuilder("li", "flex-list-item");
				if (c is Separator)
				{
					tag.AddCssClass("divider");
					tag.Render(context);
					continue;
				}
				tag.RenderStart(context);
				c.RenderElement(context);
				tag.RenderEnd(context);
			}
		}
	}
}

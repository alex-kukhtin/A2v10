// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;

namespace A2v10.Xaml
{
	[ContentProperty("Inlines")]
	public class Paragraph : UIElement
	{
		public InlineCollection Inlines { get; } = new InlineCollection();

		public Boolean Small { get; set; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var tag = new TagBuilder("p", null, IsInGrid);
			MergeAttributes(tag, context);
			tag.AddCssClassBool(Small, "text-small");
			tag.RenderStart(context);
			Inlines.Render(context);
			tag.RenderEnd(context);
		}
	}
}

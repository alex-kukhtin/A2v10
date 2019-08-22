// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;

using A2v10.Infrastructure;

namespace A2v10.Xaml
{
	[ContentProperty("Inlines")]
	public class Paragraph : UIElement
	{
		public InlineCollection Inlines { get; } = new InlineCollection();

		public Boolean Small { get; set; }
		public TextColor Color { get; set; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var tag = new TagBuilder("p", null, IsInGrid);
			MergeAttributes(tag, context);
			tag.AddCssClassBool(Small, "text-small");
			if (Color != TextColor.Default)
				tag.AddCssClass("text-color-" + Color.ToString().ToKebabCase());
			tag.RenderStart(context);
			Inlines.Render(context);
			tag.RenderEnd(context);
		}
	}
}

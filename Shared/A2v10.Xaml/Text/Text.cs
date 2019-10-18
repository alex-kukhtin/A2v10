// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using A2v10.Infrastructure;
using System;
using System.Windows.Markup;

namespace A2v10.Xaml
{
	[ContentProperty("Inlines")]
	public class Text : UIElement
	{
		public InlineCollection Inlines { get; } = new InlineCollection();

		public TextSize Size { get; set; }
		public Boolean Small { get; set; }
		public Boolean Big { get; set; }

		public Boolean Gray { get; set; }
		public TextColor Color { get; set; }
		public Boolean Block { get; set; }
		public TextAlign Align { get; set; }

		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var tag = new TagBuilder("span", null, IsInGrid);
			MergeAttributes(tag, context);
			tag.AddCssClassBool(Block, "block");
			if (Align != TextAlign.Left)
				tag.AddCssClass("text-" + Align.ToString().ToLowerInvariant());
			if (Size != TextSize.Normal)
				tag.AddCssClass("text-" + Size.ToString().ToLowerInvariant());
			else
			{
				tag.AddCssClassBool(Small, "text-small");
				tag.AddCssClassBool(Big, "text-big");
			}
			tag.AddCssClassBool(Gray, "text-gray");
			if (Color != TextColor.Default)
				tag.AddCssClass("text-color-" + Color.ToString().ToKebabCase());
			else
				tag.AddCssClassBool(Gray, "text-gray");
			tag.RenderStart(context);
			Inlines.Render(context);
			tag.RenderEnd(context);
		}
	}
}


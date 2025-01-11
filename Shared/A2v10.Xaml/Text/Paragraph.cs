// Copyright © 2015-2025 Oleksandr Kukhtin. All rights reserved.

using System;
using System.Linq;
using System.Windows.Markup;

using A2v10.Infrastructure;

namespace A2v10.Xaml;

[ContentProperty("Inlines")]
public class Paragraph : UIElement
{
	// TODO:CORE: set;
	public InlineCollection Inlines { get; } = new InlineCollection();

	public Boolean Small { get; set; }
	public TextColor Color { get; set; }

	public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
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

    protected override void OnEndInit()
    {
        base.OnEndInit();
        foreach (var inl in Inlines.OfType<XamlElement>())
            inl.SetParent(this);
    }
}

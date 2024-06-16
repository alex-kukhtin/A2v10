// Copyright © 2015-2024 Oleksandr Kukhtin. All rights reserved.

using A2v10.Infrastructure;
using System;
using System.Windows.Markup;

namespace A2v10.Xaml;

[ContentProperty("Children")]
public class Block : UIElement, ITableControl
{

	public UIElementCollection Children { get; set; } = new UIElementCollection();

	public Length Height { get; set; }
	public Length Width { get; set; }
	public Boolean Border { get; set; }
	public Boolean? Scroll { get; set; }
	public Boolean Relative { get; set; }
	public TextAlign Align { get; set; }
	public TextColor Color { get; set; }
	public BackgroundStyle Background { get; set; }
	public ShadowStyle DropShadow { get; set; }
	public Length MaxWidth { get; set; }
	public Length MaxHeight { get; set; }

	internal virtual void RenderChildren(RenderContext context)
	{
		foreach (var c in Children)
		{
			c.RenderElement(context);
		}
	}

	/*
	void AddHackedBorder(TagBuilder pane)
	{
		if (!Scroll) return;
		if (Children.Count != 1) return;
		if (Children[0] is Table tab)
		{
			if (tab.Border || tab.GridLines == GridLinesVisibility.Both || tab.GridLines == GridLinesVisibility.Horizontal)
				pane.AddCssClass("child-border");
		}
	}
	*/

	public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
	{
		if (SkipRender(context))
			return;
		var div = new TagBuilder("div", null, IsInGrid);
		onRender?.Invoke(div);
		MergeAttributes(div, context, MergeAttrMode.Margin | MergeAttrMode.Visibility);
		if (Height != null)
			div.MergeStyle("height", Height.Value);
		if (Width != null)
			div.MergeStyle("width", Width.Value);
		div.AddCssClassBool(Border, "bordered-pane");
		div.AddCssClassBoolNo(Scroll, "scroll");
		div.AddCssClassBool(Relative, "relative");

		if (DropShadow != ShadowStyle.None)
		{
			div.AddCssClass("drop-shadow");
			div.AddCssClass(DropShadow.ToString().ToLowerInvariant());
		}

		if (Background != BackgroundStyle.Default)
			div.AddCssClass("background-" + Background.ToString().ToKebabCase());
		//AddHackedBorder(div);
		if (Color != TextColor.Default)
			div.AddCssClass("text-color-" + Color.ToString().ToKebabCase());
		MergeAlign(div, context, Align);

		if (MaxWidth != null)
			div.MergeStyle("max-width", MaxWidth.Value);
		if (MaxHeight != null)
			div.MergeStyle("max-height", MaxHeight.Value);

		div.RenderStart(context);
		RenderChildren(context);
		div.RenderEnd(context);
	}

	protected override void OnEndInit()
	{
		base.OnEndInit();
		foreach (var c in Children)
			c.SetParent(this);
	}

	public override void OnSetStyles(RootContainer root)
	{
		base.OnSetStyles(root);
		foreach (var c in Children)
			c.OnSetStyles(root);
	}

	public override void OnDispose()
	{
		base.OnDispose();
		foreach (var c in Children)
			c.OnDispose();
	}
}

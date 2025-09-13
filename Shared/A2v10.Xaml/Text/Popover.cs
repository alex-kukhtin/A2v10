﻿// Copyright © 2015-2025 Oleksandr Kukhtin. All rights reserved.


using System;
using System.ComponentModel;
using System.Globalization;
using System.Windows.Markup;

using A2v10.Infrastructure;

namespace A2v10.Xaml;

public enum PopupPlacement
{
	TopRight,
	TopLeft,
	RightBottom,
	RightTop,
	BottomRight,
	BottomLeft,
	LeftBottom,
	LeftTop
}

public enum PopoverBackgroundStyle
{
	Default = 0,
	Yellow = Default,
	Cyan = 1,
	Green = 2,
	Red = 3,
	Blue = 4,
	White = 5
}

public enum PopoverUnderlineMode
{
	Enable,
	Disable,
	Hover
}

[ContentProperty("Content")]
[TypeConverter(typeof(PopoverConverter))]
public class Popover : Inline
{
	public PopupPlacement Placement { get; set; }
	public Object Content { get; set; }
	public String Text { get; set; }
	public Icon Icon { get; set; }
	public Length Width { get; set; }
	public Length Top { get; set; }

	public String Url { get; set; }
    public Object Argument { get; set; }
    public Length OffsetX { get; set; }

	public PopoverUnderlineMode Underline { get; set; }

	public PopoverBackgroundStyle Background { get; set; }

	public String Badge { get; set; }
	public Boolean ShowOnHover { get; set; }
    public UInt32 MaxChars { get; set; }
    public Int32 LineClamp { get; set; }

    public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
	{
		if (SkipRender(context))
			return;
		var po = new TagBuilder("popover", "a2-inline", IsInGrid);
		onRender?.Invoke(po);
		MergeAttributes(po, context, MergeAttrMode.All);
		po.AddCssClass("po-" + Placement.ToString().ToKebabCase());
		if (Background != PopoverBackgroundStyle.Default)
			po.AddCssClass("po-" + Background.ToString().ToKebabCase());
		if (Icon != Icon.NoIcon)
			po.MergeAttribute("icon", Icon.ToString().ToKebabCase());
		MergeBindingAttributeString(po, context, "content", nameof(Text), Text, MaxChars);
		if (OffsetX != null)
			po.MergeAttribute("offset-x", OffsetX.Value);
		if (Underline != PopoverUnderlineMode.Enable)
			po.AddCssClass("underline-" + Underline.ToString().ToLowerInvariant());
        if (LineClamp != 0)
            po.MergeAttribute(":line-clamp", LineClamp.ToString());

        var urlBind = GetBinding(nameof(Url));

		if (ShowOnHover)
		{
			po.MergeAttribute(":hover", "true");
			if (urlBind != null || !String.IsNullOrEmpty(Url))
				throw new XamlException("'ShowOnHover' and 'Url' are not compatible.");
		}

		if (urlBind != null)
			po.MergeAttribute(":url", urlBind.GetPathFormat(context));
		else if (!String.IsNullOrEmpty(Url))
			po.MergeAttribute("url", Url);

        var arg = GetBinding(nameof(Argument));
        if (arg != null)
            po.MergeAttribute(":arg", arg.GetPathFormat(context));
        else if (Argument != null)
            po.MergeAttribute("arg", Argument.ToString());

        if (Width != null)
			po.MergeAttribute("width", Width.Value);

		if (Top != null)
			po.MergeAttribute("top", Top.Value);

		po.RenderStart(context);
		var cntBind = GetBinding(nameof(Content));
		if (cntBind != null)
		{
			var cont = new TagBuilder("span");
			cont.MergeAttribute("v-text", cntBind.GetPathFormat(context));
			cont.Render(context);
		}
		else if (Content is UIElementBase)
		{
			(Content as UIElementBase).RenderElement(context);
		}
		else if (Content != null)
		{
			context.Writer.Write(context.LocalizeCheckApostrophe(Content.ToString()));
		}
		RenderPopoverBadge(context);
		po.RenderEnd(context);
	}

	void RenderPopoverBadge(RenderContext context)
	{
		if (GetBinding(nameof(Badge)) == null && Badge == null)
			return;
		var tag = new TagBuilder("template");
		tag.MergeAttribute("slot", "badge");
		tag.RenderStart(context);
		RenderBadge(context, Badge);
		tag.RenderEnd(context);
	}


	protected override void OnEndInit()
	{
		base.OnEndInit();
		if (Background == PopoverBackgroundStyle.Yellow)
			Background = PopoverBackgroundStyle.Default;
        if (Content is XamlElement xamlElem)
            xamlElem.SetParent(this);
    }
}

internal class PopoverConverter : TypeConverter
{
	public override Boolean CanConvertFrom(ITypeDescriptorContext context, Type sourceType)
	{
		if (sourceType == typeof(String))
			return true;
		else if (sourceType == typeof(Popover))
			return true;
		else if (sourceType == typeof(UIElement))
			return true;
		return false;
	}

	public override Object ConvertFrom(ITypeDescriptorContext context, CultureInfo culture, Object value)
	{
		if (value == null)
			return null;
		if (value is String strValue)
			return new Popover()
			{
				Content = strValue
			};
		else if (value is Popover)
			return value;
		else if (value is UIElement uiValue)
			return new Popover() {
				Content = uiValue,
				Icon = Icon.HelpOutline
			};
		throw new XamlException($"Invalid Popover converter value '{value}'");
	}
}

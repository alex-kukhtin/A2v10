// Copyright © 2023 Oleksandr Kukhtin. All rights reserved.

using A2v10.Infrastructure;
using System;

namespace A2v10.Xaml;

public class KanbanCard : Container, ITableControl
{
    public Object Header { get; set; }
    public Object Footer { get; set; }
    public ShadowStyle DropShadow { get; set; }
    public BackgroundStyle Background { get; set; }
    public Command Command { get; set; }

    Boolean HasHeader => GetBinding(nameof(Header)) != null || Header != null;
    Boolean HasFooter => GetBinding(nameof(Footer)) != null || Footer != null;

    public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
    {
        if (SkipRender(context))
            return;
        var card = new TagBuilder("div", "kanban-card", IsInGrid);
        onRender?.Invoke(card);
        MergeAttributes(card, context);
        MergeCommandAttribute(card, context);
        if (DropShadow != ShadowStyle.None)
        {
            card.AddCssClass("drop-shadow");
            card.AddCssClass(DropShadow.ToString().ToLowerInvariant());
        }
        if (Background != BackgroundStyle.Default)
            card.AddCssClass("background-" + Background.ToString().ToKebabCase());
        card.RenderStart(context);
        RenderHeader(context);
        var body = new TagBuilder("div", "kanban-card-body");
        body.RenderStart(context);
        RenderChildren(context);
        body.RenderEnd(context);    
        RenderFooter(context);
        card.RenderEnd(context);
    }

    private void RenderHeader(RenderContext context) 
    {
        if (!HasHeader)
            return;
        var h = new TagBuilder("div", "kanban-card-header");
        h.RenderStart(context);
        var hb = GetBinding(nameof(Header));
        if (hb != null)
        {
            var s = new TagBuilder("span");
            s.MergeAttribute("v-text", hb.GetPathFormat(context));
            s.Render(context);
        }
        else if (Header is UIElementBase hUiElem)
        {
            hUiElem.RenderElement(context);
        }
        else if (Header is String hStr)
        {
            context.Writer.Write(context.LocalizeCheckApostrophe(hStr));
        }
        h.RenderEnd(context);
    }
    private void RenderFooter(RenderContext context)
    {
        if (!HasFooter)
            return;
        var f = new TagBuilder("div", "kanban-card-footer");
        f.RenderStart(context);
        var fb = GetBinding(nameof(Footer));
        if (fb != null)
        {
            var s = new TagBuilder("span");
            s.MergeAttribute("v-text", fb.GetPathFormat(context));
            s.Render(context);
        }
        else if (Footer is UIElementBase fUiElem)
        {
            fUiElem.RenderElement(context);
        }
        else if (Footer is String fStr)
        {
            context.Writer.Write(context.LocalizeCheckApostrophe(fStr));
        }
        f.RenderEnd(context);

    }
}

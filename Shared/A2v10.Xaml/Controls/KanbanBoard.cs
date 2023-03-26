// Copyright © 2023 Oleksandr Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;

namespace A2v10.Xaml;

[ContentProperty("Card")]
public class KanbanBoard : UIElement
{
    public Object Lanes { get; set; }
    public Object Items { get; set; }
    public String StateProperty { get; set; }
    public String DropDelegate { get; set; }

    public UIElementCollection Header { get; set; } = new UIElementCollection();
    public UIElementCollection Footer { get; set; } = new UIElementCollection();
    public UIElementCollection Card { get; set; } = new UIElementCollection();

    public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
    {
        if (SkipRender(context))
            return;
        var kb = new TagBuilder("a2-kanban", null, IsInGrid);
        onRender?.Invoke(kb);   
        MergeAttributes(kb, context);
        kb.MergeAttribute("state-prop", StateProperty);
        if (!String.IsNullOrEmpty(DropDelegate))
            kb.MergeAttribute(":drop-delegate", $"$delegate('{DropDelegate}')");
        var lanesBind = GetBinding(nameof(Lanes));
        if (lanesBind != null)
            kb.MergeAttribute(":lanes", lanesBind.GetPath(context));
        var itemsBind = GetBinding(nameof(Items));
        if (itemsBind != null)
            kb.MergeAttribute(":items", itemsBind.GetPath(context));

        kb.RenderStart(context);
        // header
        var header = new TagBuilder("template");
        header.MergeAttribute("v-slot:header", "{lane}");
        header.RenderStart(context);
        using (new ScopeContext(context, "lane", lanesBind.Path))
        {
            foreach (var ch in Header)
                ch.RenderElement(context, null);
        }
        header.RenderEnd(context);
        // card
        var card = new TagBuilder("template");
        card.MergeAttribute("v-slot:card", "{card}");
        card.RenderStart(context);
        using (new ScopeContext(context, "card", itemsBind.Path))
        {
            foreach (var ch in Card)
                ch.RenderElement(context, null);
        }
        header.RenderEnd(context);
        // footer
        var footer = new TagBuilder("template");
        footer.MergeAttribute("v-slot:footer", "{lane}");
        footer.RenderStart(context);
        using (new ScopeContext(context, "lane", lanesBind.Path))
        {
            foreach (var ch in Footer)
                ch.RenderElement(context, null);
        }
        footer.RenderEnd(context);
        // end of control
        kb.RenderEnd(context);
    }
}

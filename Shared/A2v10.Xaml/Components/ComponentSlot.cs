// Copyright © 2022-2025 Oleksandr Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml;

public class ComponentSlot : UIElementBase
{
    public String Name { get; set; }
    public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
    {
        if (Name == null)
            throw new InvalidOperationException("ComponentSlot. Name is required");
        if (context.RenderedComponent == null)
            return;

        if (context.RenderedComponent.Slots.TryGetValue(Name, out UIElementBase slot))
            if (slot != null)
                slot.RenderElement(context, onRender);
    }
}

// Copyright © 2022-2025 Oleksandr Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Windows.Markup;

namespace A2v10.Xaml;

public class SlotDictionary : Dictionary<String, UIElementBase>
{
}

[ContentProperty("Slots")]
public class Component : UIElementBase
{
	const String SLOT_ITEM = "__comp__";

	public Object Scope { get; set; }
	public String Name { get; set; }
	public SlotDictionary Slots { get; set; } = new SlotDictionary();

    public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
	{
		if (SkipRender(context))
			return;
		var comp = context.FindComponent(Name);
		if (comp == null)
			throw new XamlException($"Component '{Name}' not found");
		if (!(comp is UIElementBase compUi))
			throw new XamlException($"The component '{Name}' is not an UIElement");
		var scopeBind = GetBinding(nameof(Scope));
		if (scopeBind == null)
		{
			compUi.SetParent(this);
			context.RenderedComponent = this;
			compUi.RenderElement(context, onRender);
            context.RenderedComponent = null;
            return;
		}

		String slotItem = $"{SLOT_ITEM}{context.ScopeLevel}";

		var tag = new TagBuilder("template", null, IsInGrid);
		tag.MergeAttribute("v-if", $"!!{scopeBind.GetPathFormat(context)}");
		tag.MergeAttribute("v-for", $"{slotItem} in [{scopeBind.GetPath(context)}]");

		tag.RenderStart(context);
		using (var ctx = new ScopeContext(context, slotItem, scopeBind.Path))
		{
			compUi.SetParent(this);
			compUi.IsInGrid = IsInGrid;
            context.RenderedComponent = this;
            compUi.RenderElement(context);
            context.RenderedComponent = null;
        }
        tag.RenderEnd(context);
	}
    protected override void OnEndInit()
    {
        base.OnEndInit();
        foreach (var c in Slots.Values)
            c.SetParent(this);
    }
    public override void OnSetStyles(RootContainer root)
    {
        base.OnSetStyles(root);
        foreach (var c in Slots.Values)
            c.OnSetStyles(root);
    }
}


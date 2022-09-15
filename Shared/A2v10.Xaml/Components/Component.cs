// Copyright © 2022 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml;

public class Component : UIElementBase
{
	const String SLOT_ITEM = "__comp__";

	public Object Scope { get; set; }
	public String Name { get; set; }

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
			compUi.RenderElement(context, onRender);
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
			compUi.RenderElement(context);
		}
		tag.RenderEnd(context);
	}
}

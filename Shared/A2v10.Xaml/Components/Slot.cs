// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;

namespace A2v10.Xaml
{
	[ContentProperty("Children")]
	public class Slot : UIElementBase
	{
		const String SLOT_ITEM = "__si__";

		public Object Scope { get; set; }
		public UIElementBase Fallback { get; set; }
		public UIElementCollection Children { get; set; } = new UIElementCollection();

		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var scopeBind = GetBinding(nameof(Scope));
			if (scopeBind == null)
				throw new XamlException("Scope must be specified for Slot component");

			String slotItem = $"{SLOT_ITEM}{context.ScopeLevel}";

			var tag = new TagBuilder("template", null, IsInGrid);
			tag.MergeAttribute("v-if", $"!!{scopeBind.GetPathFormat(context)}");
			tag.MergeAttribute("v-for", $"{slotItem} in [{scopeBind.GetPath(context)}]");

			tag.RenderStart(context);
			using (var ctx = new ScopeContext(context, slotItem, scopeBind.Path))
			{
				foreach (var c in Children)
				{
					c.IsInGrid = IsInGrid;
					c.RenderElement(context);
				}
			}
			tag.RenderEnd(context);
			if (Fallback != null)
			{
				var fb = new TagBuilder("template");
				fb.MergeAttribute("v-if", $"!{scopeBind.GetPathFormat(context)}");
				fb.RenderStart(context);
				Fallback.RenderElement(context);
				fb.RenderEnd(context);
			}
		}
	}
}

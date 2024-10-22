// Copyright © 2024 Oleksandr Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml;

public class Calendar : UIElementBase
{
	public Object Events { get; set; }
	public Object Start { get; set; }
	public Object View { get; set; }
	public String CssClass { get; set; }
	public Object Delegates { get; set; }

	public UIElement MonthEventTemplate { get; set; }
	public UIElement WeekEventTemplate { get; set; }
	public UIElementCollection ButtonsTemplate { get; set; }
	public UIElementCollection ToolbarTemplate { get; set; }

	public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
	{
		if (SkipRender(context))
			return;
		var tag = new TagBuilder("a2-big-calendar", null, IsInGrid);
		onRender?.Invoke(tag);
		MergeAttributes(tag, context);
		tag.AddCssClass(CssClass);
		var eventsBind = GetBinding(nameof(Events))
			?? throw new XamlException("Events binding is required for the Calendar element");
		tag.MergeAttribute(":events", eventsBind.GetPath(context));

		MergeValueItemPropSimple(tag, context, nameof(Start), ":item", "prop");
		MergeValueItemPropSimple(tag, context, nameof(View), ":view-item", "view-prop");

		var delegatesBind = GetBinding(nameof(Delegates));
		if (delegatesBind != null)
			tag.MergeAttribute(":delegates", delegatesBind.GetPath(context));

		tag.RenderStart(context);
		if (WeekEventTemplate != null)
		{
			var wt = new TagBuilder("template");
			wt.MergeAttribute("v-slot:weekev", "wevt");
			wt.RenderStart(context);
			using (var ctx = new ScopeContext(context, "wevt.item", null))
			{
				WeekEventTemplate.RenderElement(context);
			}
			wt.RenderEnd(context);
		}
		if (MonthEventTemplate != null)
		{
			var wt = new TagBuilder("template");
			wt.MergeAttribute("v-slot:monthev", "mevt");
			wt.RenderStart(context);
			using (var ctx = new ScopeContext(context, "mevt.item", null))
			{
				MonthEventTemplate.RenderElement(context);
			}
			wt.RenderEnd(context);
		}

		if (ButtonsTemplate != null)
		{
			var wt = new TagBuilder("template");
			wt.MergeAttribute("v-slot:topbar", "el");
			wt.RenderStart(context);
			foreach (var el in ButtonsTemplate)
				el.RenderElement(context, tag => tag.AddCssClass("btn-tb"));
			wt.RenderEnd(context);
		}
		if (ToolbarTemplate != null)
		{
			var wt = new TagBuilder("template");
			wt.MergeAttribute("v-slot:leftbar", "el");
			wt.RenderStart(context);
			foreach (var el in ToolbarTemplate)
				el.RenderElement(context, tag => tag.AddCssClass("btn-tb"));
			wt.RenderEnd(context);
		}
		tag.RenderEnd(context);
	}

	protected void MergeValueItemPropSimple(TagBuilder input, RenderContext context, String valueName,
			String itemPropName, String propPropName)
	{
		var valBind = GetBinding(valueName)
			?? throw new XamlException($"{valueName} binding is required for the Calendar element");
		// split to path and property
		String path = valBind.GetPath(context);
		(String Path, String Prop) = SplitToPathProp(path);
		if (String.IsNullOrEmpty(Path) || String.IsNullOrEmpty(Prop))
			throw new XamlException($"Invalid binding for {valueName} '{path}'");
		input.MergeAttribute(itemPropName, Path);
		input.MergeAttribute(propPropName, Prop);
	}
}


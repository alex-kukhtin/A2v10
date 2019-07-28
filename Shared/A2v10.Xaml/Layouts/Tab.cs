// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;

namespace A2v10.Xaml
{
	public class TabCollection : List<Tab>
	{
	}

	/*
     * TODO:
     * 1. Можно добавить раскраску. атрибут tab-style="yellow", а в Tab.less есть такой класс
     */

	public class Tab : Container
	{
		public Object Header { get; set; }
		public String Badge { get; set; }

		public Length Height { get; set; }
		public Boolean FullHeight { get; set; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var tab = new TagBuilder("a2-tab-item");
			onRender?.Invoke(tab);
			// tab.MergeAttribute("tab-style", "yellow");
			tab.AddCssClassBool(FullHeight, "full-height");
			MergeAttributes(tab, context, MergeAttrMode.SpecialTab);
			var headerBind = GetBinding(nameof(Header));
			if (headerBind != null)
				tab.MergeAttribute(":header", headerBind.GetPathFormat(context));
			else if (Header is String)
				tab.MergeAttribute("header", context.LocalizeCheckApostrophe(Header?.ToString()));
			var badgeBind = GetBinding(nameof(Badge));
			if (badgeBind != null)
				tab.MergeAttribute(":badge", badgeBind.GetPathFormat(context));
			else if (Badge != null)
				tab.MergeAttribute("badge", Badge);
			if (Height != null)
				tab.MergeStyle("height", Height.Value);

			// show/hide support
			MergeBindingAttributeBool(tab, context, ":show", nameof(Show), Show);
			// emulate v-hide
			MergeBindingAttributeBool(tab, context, ":show", nameof(Hide), Hide, bInvert: true);

			tab.RenderStart(context);

			RenderChildren(context);

			tab.RenderEnd(context);
		}

		internal void RenderTemplate(RenderContext context)
		{
			// without outer tag
			RenderChildren(context);
		}
	}
}

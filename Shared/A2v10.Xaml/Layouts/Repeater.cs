// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;

namespace A2v10.Xaml
{
	[ContentProperty("Content")]
	public class Repeater : UIElement
	{
		public Object ItemsSource { get; set; }
		public UIElementBase Content { get; set; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var isBind = GetBinding(nameof(ItemsSource));
			if (isBind == null)
				return;
			var div = new TagBuilder("div", null, IsInGrid);
			onRender?.Invoke(div);
			MergeAttributes(div, context);
			div.MergeAttribute("v-for", $"(elem, elemIndex) in {isBind.GetPath(context)}");
			div.MergeAttribute(":key", "elemIndex");
			div.RenderStart(context);
			if (Content != null)
			{
				using (new ScopeContext(context, "elem"))
				{
					Content.RenderElement(context);
				}
			}
			div.RenderEnd(context);
		}
	}
}

// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using A2v10.Infrastructure;

namespace A2v10.Xaml
{
	public enum CommandBarVisibility
	{
		Default,
		Active
	}

	public class CommandBar : Container
	{
		public CommandBarVisibility Visibility { get; set; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			var tb = new TagBuilder("div", "commandbar", IsInGrid);
			if (onRender != null)
				onRender(tb);
			if (Visibility != CommandBarVisibility.Default)
				tb.AddCssClass("visible-" + Visibility.ToString().ToKebabCase());
			MergeAttributes(tb, context);
			tb.RenderStart(context);
			RenderChildren(context);
			tb.RenderEnd(context);
		}
	}
}

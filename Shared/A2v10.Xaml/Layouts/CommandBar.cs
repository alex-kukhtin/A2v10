// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using A2v10.Infrastructure;

namespace A2v10.Xaml
{
	public enum CommandBarVisibility
	{
		Default,
		Active,
		Hover
	}

	public class CommandBar : Container, ITableControl
	{
		public CommandBarVisibility Visibility { get; set; }

		public FloatMode Float { get; set; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var tb = new TagBuilder("div", "commandbar", IsInGrid);
			onRender?.Invoke(tb);
			if (Visibility != CommandBarVisibility.Default)
				tb.AddCssClass("visible-" + Visibility.ToString().ToKebabCase());
			if (Float != FloatMode.None)
				tb.AddCssClass("float-" + Float.ToString().ToLowerInvariant());
			MergeAttributes(tb, context);
			tb.RenderStart(context);
			RenderChildren(context);
			tb.RenderEnd(context);
		}
	}
}

// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using A2v10.Infrastructure;
using System;

namespace A2v10.Xaml
{
	public class Taskpad : Container
	{

		public Length Width { get; set; }
		public BackgroundStyle Background { get; set; }
		public Boolean? Collapsible { get; set; }
		public String Title { get; set; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var tag = new TagBuilder("a2-taskpad", null, IsInGrid);
			onRender?.Invoke(tag);
			MergeAttributes(tag, context);
			MergeBindingAttributeString(tag, context, "title", nameof(Title), Title);

			if (Background != BackgroundStyle.None)
				tag.AddCssClass("background-" + Background.ToString().ToKebabCase());

			tag.AddCssClassBoolNo(Collapsible, "collapsible");

			tag.RenderStart(context);
			RenderChildren(context);
			tag.RenderEnd(context);
		}
	}
}

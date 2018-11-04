// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;

namespace A2v10.Xaml
{
	[ContentProperty("Content")]
	public class EUSignFrame : UIElementBase
	{
		public UIElement Content { get; set; }
		public Length Height { get; set; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			var tag = new TagBuilder("iframe");
			tag.MergeAttribute("frameborder", "0");
			tag.AddCssClass("eusign-iframe");
			tag.MergeAttribute("src", $"/_iframe/{context.Path}");
			if (Height != null)
				tag.MergeStyle("height", Height.Value);
			//tag.MergeAttribute(context.RootId)
			tag.Render(context);
		}

		public void RenderTwoPhaseContent(RenderContext context)
		{
			var div = new TagBuilder("div");
			div.MergeAttribute("id", context.RootId);
			div.RenderStart(context);
			Content.RenderElement(context);
			div.RenderEnd(context);
		}
	}
}

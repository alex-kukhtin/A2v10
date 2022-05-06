// Copyright © 2015-2022 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
	public class PartialBlock : RootContainer
	{
		public Boolean FullHeight { get; set; }
		public Length Height { get; set; }

		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var block = new TagBuilder("div", "partial-block");
			block.MergeAttribute("id", context.RootId);
			MergeAttributes(block, context, MergeAttrMode.Margin);
			if (Height != null)
				block.MergeStyle("height", Height.Value);

			block.AddCssClass(CssClass);
			block.AddCssClassBool(FullHeight, "full-height");

			block.RenderStart(context);
			RenderChildren(context);
			RenderContextMenus();
			RenderAccelCommands(context);
			block.RenderEnd(context);
		}
	}
}

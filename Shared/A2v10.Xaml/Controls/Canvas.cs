// Copyright © 2023 Oleksandr Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml;

public class Canvas : UIElementBase
{
	public Int32 Width { get; set; }
	public Int32 Height { get; set; }
	public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
	{
		var tag = new TagBuilder("canvas", null, IsInGrid);
		onRender?.Invoke(tag);
		MergeAttributes(tag, context);

		if (Width != 0)
			tag.MergeAttribute("width", Width);
		if (Height != 0)
			tag.MergeAttribute("height", Height);

		tag.Render(context, TagRenderMode.Normal);
	}
}

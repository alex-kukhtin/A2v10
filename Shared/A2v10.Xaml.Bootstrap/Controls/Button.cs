// Copyright © 2021-2022 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml.Bootstrap;

public class Button : BsElement
{
	public Boolean Outline { get; set; }

	public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
	{
		var btn = new TagBuilder("button", "btn");
		onRender?.Invoke(btn);
		btn.MergeAttribute("type", "button");
		btn.RenderStart(context);
		context.Writer.Write("Button");
		//RenderContent(context);
		btn.RenderEnd(context);
	}
}

// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
	public class Partial : RootContainer
	{
		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			var page = new TagBuilder("div", "page partial");
			page.MergeAttribute("id", context.RootId);
			page.RenderStart(context);
			RenderChildren(context);
			page.RenderEnd(context);
		}
	}
}

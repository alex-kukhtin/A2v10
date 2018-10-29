// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
	public class Line : Inline
	{
		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var hr = new TagBuilder("hr", null, IsInGrid);
			MergeAttributes(hr, context, MergeAttrMode.Visibility | MergeAttrMode.Margin);
			hr.Render(context, TagRenderMode.SelfClosing);
		}
	}
}

// Copyright © 2018 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml.Drawing
{
	public class Group : DrawingElement
	{
		internal override void RenderElement(RenderContext context)
		{
			var g = new TagBuilder("g");
			MergeAttributes(g, context);
			g.RenderStart(context);
			g.RenderEnd(context);
		}
	}
}

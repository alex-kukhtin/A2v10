// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml.Drawing
{
	public class ActionButton : DrawingElement
	{
		public Icon Icon { get; set; }

		internal override void RenderElement(RenderContext context)
		{
			var g = new TagBuilder("g", "action-button");
			MergeAttributes(g, context);
			g.RenderStart(context);
			var r = new TagBuilder("rect");
			SetPositionAndSize(r);
			r.Render(context);
			var f = new TagBuilder("foreignObject");
			f.RenderStart(context);
			SetPositionAndSize(f);
			f.RenderEnd(context);
			g.RenderEnd(context);
		}

		void SetPositionAndSize(TagBuilder t)
		{

		}
	}
}

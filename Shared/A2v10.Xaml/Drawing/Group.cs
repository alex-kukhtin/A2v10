// Copyright © 2018 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;

namespace A2v10.Xaml.Drawing
{
	[ContentProperty("Content")]
	public class Group : DrawingElement
	{
		public DrawingElementCollection Content { get; set; } = new DrawingElementCollection();

		public Boolean DropShadow { get; set; }

		internal override void RenderElement(RenderContext context)
		{
			var g = new TagBuilder("g");
			MergeAttributes(g, context);
			if (DropShadow)
			{
				g.MergeAttribute("filter", "url(#dropShadow)");
			}
			g.RenderStart(context);
			foreach (var c in Content)
				c.RenderElement(context);
			g.RenderEnd(context);
		}
	}
}

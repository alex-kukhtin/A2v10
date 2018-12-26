// Copyright © 2018 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;

namespace A2v10.Xaml.Drawing
{
	public class Rectangle : DrawingElement, IHasPositionAndSize
	{
		public Size Size { get; set; }
		public Point Pos { get; set; }
		public RectStyle Style { get; set; }

		internal override void RenderElement(RenderContext context)
		{
			var r = new TagBuilder("rect");
			MergeAttributes(r, context);
			this.SetPositionAndSize(r);
			if (Style != RectStyle.None)
				r.AddCssClass($"d-{Style.ToString().ToLowerInvariant()}");
			r.Render(context);
		}
	}
}

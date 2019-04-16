// Copyright © 2018-2019 Alex Kukhtin. All rights reserved.

using A2v10.Infrastructure;

namespace A2v10.Xaml.Drawing
{
	public class Rectangle : DrawingElement, IHasPositionAndSize
	{
		public Size Size { get; set; }
		public Point Pos { get; set; }
		public RectStyle Style { get; set; }
		public BorderStyle Border { get; set; }

		internal override void RenderElement(RenderContext context)
		{
			var r = new TagBuilder("rect");
			MergeAttributes(r, context);
			this.SetPositionAndSize(r);
			if (Style != RectStyle.None)
				r.AddCssClass($"d-{Style.ToString().ToKebabCase()}");
			if (Border != BorderStyle.Default)
				r.AddCssClass($"d-border-{Border.ToString().ToKebabCase()}");
			r.Render(context);
		}
	}
}

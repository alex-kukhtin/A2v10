// Copyright © 2018 Alex Kukhtin. All rights reserved.

namespace A2v10.Xaml.Drawing
{
	public class Rectangle : DrawingElement
	{
		internal override void RenderElement(RenderContext context)
		{
			var r = new TagBuilder("rect");
			MergeAttributes(r, context);
			r.Render(context);
		}
	}
}

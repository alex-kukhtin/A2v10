// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml.Drawing
{
	public class Diagram : DrawingElement
	{
		internal override void RenderElement(RenderContext context)
		{
			var div = new TagBuilder("div", "diagram");
			div.RenderStart(context);
			MergeAttributes(div, context);
			RenderDiagram(context);
			div.RenderEnd(context);
		}

		void RenderDiagram(RenderContext context)
		{
			var svg = new TagBuilder("svg");
			svg.MergeAttribute("xmlns", "http://www.w3.org/2000/svg");
			svg.RenderStart(context);
			RenderDefs(context);
			svg.RenderEnd(context);
		}

		void RenderDefs(RenderContext context)
		{

		}
	}
}

// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;

using A2v10.Xaml.Properties;

namespace A2v10.Xaml.Drawing
{
	[ContentProperty("Content")]
	public class Diagram : UIElementBase
	{
		public DrawingElementCollection Content { get; set; } = new DrawingElementCollection();

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			var div = new TagBuilder("div", "diagram");
			MergeAttributes(div, context);
			div.RenderStart(context);
			RenderDiagram(context);
			div.RenderEnd(context);
		}

		void RenderDiagram(RenderContext context)
		{
			var svg = new TagBuilder("svg");
			svg.MergeAttribute("xmlns", "http://www.w3.org/2000/svg");
			svg.MergeAttribute("shape-rendering","geometricPrecision");
			svg.RenderStart(context);
			RenderDefs(context);
			foreach (var c in Content)
				c.RenderElement(context);
			svg.RenderEnd(context);
		}

		void RenderDefs(RenderContext context)
		{
			var defs = Resources.svgdefs;
			context.Writer.Write(defs);
		}
	}
}

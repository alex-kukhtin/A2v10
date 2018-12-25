// Copyright © 2018 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml.Drawing
{
	public enum LineMarkerStyle
	{
		None,
		Arrow,
	}

	public class Line : DrawingElement
	{
		public LineMarkerStyle MarkerStart { get; set; }
		public LineMarkerStyle MarkerEnd { get; set; }

		internal override void RenderElement(RenderContext context)
		{
			var p = new TagBuilder("path", "line");
			MergeAttributes(p, context);
			if (MarkerStart == LineMarkerStyle.Arrow)
				p.MergeAttribute("marker-start", "url(#arrow-start)");
			if (MarkerEnd == LineMarkerStyle.Arrow)
				p.MergeAttribute("marker-end", "url(#arrow-end)");
			p.Render(context);
		}
	}
}

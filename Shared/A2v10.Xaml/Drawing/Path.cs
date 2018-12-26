// Copyright © 2018 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml.Drawing
{
	public class Path : DrawingElement, IHasMarkers
	{
		public PointCollection Points { get; set; } = new PointCollection();

		public LineMarkerStyle MarkerStart { get; set; }
		public LineMarkerStyle MarkerEnd { get; set; }

		internal override void RenderElement(RenderContext context)
		{
			var p = new TagBuilder("path", "path");
			p.MergeAttribute("d", Points.ToPath());
			this.SetMarkers(p);
			p.Render(context);
		}
	}
}

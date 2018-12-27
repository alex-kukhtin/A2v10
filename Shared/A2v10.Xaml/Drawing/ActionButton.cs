// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;

namespace A2v10.Xaml.Drawing
{
	[ContentProperty("Content")]
	public class ActionButton : DrawingElement, IHasPositionAndSize
	{
		public Icon Icon { get; set; }

		public Size Size { get; set; }
		public Point Pos { get; set; }

		public Object Content { get; set; }
		public Command Command { get; set; }

		internal override void RenderElement(RenderContext context)
		{
			var g = new TagBuilder("g", "action-button");
			MergeAttributes(g, context);
			MergeCommandAttribute(g, context);
			g.RenderStart(context);
			var r = new TagBuilder("rect");
			this.SetPositionAndSize(r);
			r.Render(context);

			var f = new TagBuilder("foreignObject");
			this.SetPositionAndSize(f);
			f.RenderStart(context);
			RenderBody(context);
			f.RenderEnd(context);
			g.RenderEnd(context);
		}

		void RenderBody(RenderContext context)
		{
			var div = new TagBuilder("div", "d-ab-body");
			div.RenderStart(context);
			RenderIcon(context, Icon, "d-ab-ico");
			if (Content != null)
			{
				// TODO: binding
				var span = new TagBuilder("span", "d-ab-text");
				span.SetInnerText(Content.ToString());
				span.Render(context);
			}
			div.RenderEnd(context);
		}
	}
}

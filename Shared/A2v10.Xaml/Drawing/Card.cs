// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;


namespace A2v10.Xaml.Drawing
{
	public class Card : DrawingElement, IHasPositionAndSize
	{
		public Size Size { get; set; }
		public Point Pos { get; set; }
		public RectStyle Style { get; set; }
		public Icon Icon { get; set; }
		public String Header { get; set; }
		public Object Text { get; set; }
		public Popover Hint { get; set; }

		internal override void RenderElement(RenderContext context)
		{
			var g = new TagBuilder("g", "card");
			MergeAttributes(g, context);
			g.RenderStart(context);
			var r = new TagBuilder("rect");
			this.SetPositionAndSize(r);
			if (Style != RectStyle.None)
				r.AddCssClass($"d-{Style.ToString().ToLowerInvariant()}");
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
			var div = new TagBuilder("div", "d-card-body");
			div.RenderStart(context);
			RenderIcon(context, Icon, "d-card-ico");
			var hb = GetBinding(nameof(Header));
			if (hb != null || Header != null || Hint != null)
			{
				var h = new TagBuilder("span", "d-card-header");
				h.RenderStart(context);
				var innerSpan = new TagBuilder("span");
				if (hb != null)
					innerSpan.MergeAttribute("v-text", hb.GetPathFormat(context));
				innerSpan.RenderStart(context);
				if (Header != null)
					context.Writer.Write(Header);
				innerSpan.RenderEnd(context);
				if (Hint != null)
					RenderHint(context);
				h.RenderEnd(context);
			}
			var tb = GetBinding(nameof(Text));
			if (tb != null || Text != null)
			{
				var t = new TagBuilder("span", "d-card-text");
				if (tb != null)
					t.MergeAttribute("v-text", tb.GetPathFormat(context));
				t.RenderStart(context);
				if (Text != null)
				{
					if (Text is UIElement tUi)
						tUi.RenderElement(context);
					else if (Text is String tStr)
						context.Writer.Write(tStr);
				}
				t.RenderEnd(context);
			}
			div.RenderEnd(context);
		}

		void RenderHint(RenderContext context)
		{
			if (Hint == null)
				return;
			if (Hint.Icon == Icon.NoIcon)
				Hint.Icon = Icon.Help;
			var tag = new TagBuilder("span");
			tag.RenderStart(context);
			Hint.RenderElement(context, (t) =>
			{
				t.AddCssClass("hint");
			});
			tag.RenderEnd(context);
		}
	}
}

// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;

using A2v10.Infrastructure;

namespace A2v10.Xaml
{
	public class FlexPanel : Container, ITableControl
	{
		public Object Header { get; set; }

		public BackgroundStyle Background { get; set; }
		public ShadowStyle DropShadow { get; set; }

		Boolean HasHeader => GetBinding(nameof(Header)) != null || Header != null;

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var panel = new TagBuilder("div", "flex-panel", IsInGrid);
			MergeAttributes(panel, context);
			if (Background != BackgroundStyle.None)
				panel.AddCssClass("background-" + Background.ToString().ToKebabCase());
			if (DropShadow != ShadowStyle.None)
			{
				panel.AddCssClass("drop-shadow");
				panel.AddCssClass(DropShadow.ToString().ToLowerInvariant());
			}
			panel.RenderStart(context);
			RenderHeader(context);
			RenderChildren(context);
			panel.RenderEnd(context);
		}

		void RenderHeader(RenderContext context)
		{
			if (!HasHeader)
				return;
			var h = new TagBuilder("div", "flex-panel-header");
			h.RenderStart(context);
			var hb = GetBinding(nameof(Header));
			if (hb != null)
			{
				var s = new TagBuilder("span");
				s.MergeAttribute(":text", hb.GetPathFormat(context));
				s.Render(context);
			}
			else if (Header is UIElement hUiElem) {
				hUiElem.RenderElement(context);
			}
			else if (Header is String hStr)
			{
				context.Writer.Write(hStr);
			}
			h.RenderEnd(context);
		}
	}
}

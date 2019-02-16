// Copyright © 2019 Alex Kukhtin. All rights reserved.


using System;
using System.Windows.Markup;

namespace A2v10.Xaml
{
	[ContentProperty("Buttons")]
	public class TabBar : UIElement
	{
		public TabButtonCollection Buttons { get; set; } = new TabButtonCollection();
		public Object Value { get; set; }
		public ShadowStyle DropShadow { get; set; }
		public Object Description { get; set; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var panel = new TagBuilder("div", "a2-tab-bar", IsInGrid);
			onRender?.Invoke(panel);
			MergeAttributes(panel, context);
			if (DropShadow != ShadowStyle.None)
			{
				panel.AddCssClass("drop-shadow");
				panel.AddCssClass(DropShadow.ToString().ToLowerInvariant());
			}

			panel.RenderStart(context);
			RenderButtons(context);
			if (HasDescription)
				RenderDesription(context);
			panel.RenderEnd(context);
		}

		Boolean HasDescription => Description != null || GetBinding(nameof(Description)) != null;

		void RenderButtons(RenderContext context)
		{
			String valPath = null;
			var valBind = GetBinding(nameof(Value));
			valPath = valBind?.GetPathFormat(context);
			foreach (var b in Buttons)
			{
				var tag = new TagBuilder(null, "a2-tab-bar-item");
				tag.RenderStart(context);
				b.RenderMe(context, valPath);
				tag.RenderEnd(context);
			}
		}

		void RenderDesription(RenderContext context)
		{
			new Separator().RenderElement(context);
			var dBind = GetBinding(nameof(Description));
			var wrap = new TagBuilder(null, "a2-tab-description");
			wrap.RenderStart(context);
			if (dBind != null)
			{
				var span = new TagBuilder("span");
				span.MergeAttribute("v-text", dBind.GetPathFormat(context));
				span.Render(context);
			}
			else if (Description is UIElementBase uiDescr)
				uiDescr.RenderElement(context);
			else if (Description != null)
				context.Writer.Write(Description.ToString());
			wrap.RenderEnd(context);
		}

	}
}

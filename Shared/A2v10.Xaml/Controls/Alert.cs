// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;

namespace A2v10.Xaml
{

	public enum AlertStyle
	{
		Default,
		Success,
		Warning,
		Info,
		Danger
	}

	[ContentProperty("Content")]
	public class Alert : UIElementBase
	{
		public Object Content { get; set; }
		public AlertStyle Style { get; set; }
		public Icon Icon { get; set; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			var tag = new TagBuilder("div", "alert", IsInGrid);
			MergeAttributes(tag, context);
			if (Style != AlertStyle.Default)
				tag.AddCssClass(Style.ToString().ToLowerInvariant());
			tag.RenderStart(context);
			RenderIcon(context, Icon);
			if (Content is UIElementBase)
			{
				(Content as UIElementBase).RenderElement(context, null);
			}
			else
			{
				var span = new TagBuilder("span");
				var cbind = GetBinding(nameof(Content));
				if (cbind != null)
					span.MergeAttribute("v-text", cbind.GetPathFormat(context));
				else if (Content != null)
					span.SetInnerText(Content.ToString());
				span.Render(context);
			}
			tag.RenderEnd(context);
		}
	}
}

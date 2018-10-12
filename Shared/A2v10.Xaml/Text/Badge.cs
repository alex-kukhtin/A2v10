// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;

namespace A2v10.Xaml
{
	[ContentProperty("Content")]
	public class Badge : Inline
	{
		public Object Content { get; set; }
		public Boolean Small { get; set; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var span = new TagBuilder("span", "a2-badge", IsInGrid);
			onRender?.Invoke(span);
			MergeAttributes(span, context);

			var cbind = GetBinding(nameof(Content));
			if (cbind != null)
			{
				span.MergeAttribute("v-text", cbind.GetPathFormat(context));
				if (cbind.NegativeRed)
					span.MergeAttribute(":class", $"$getNegativeRedClass({cbind.GetPath(context)})");
			}
			span.AddCssClassBool(Small, "small");

			span.RenderStart(context);
			if (Content is String)
				context.Writer.Write(context.Localize(Content.ToString()));
			span.RenderEnd(context);
		}
	}
}

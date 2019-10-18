// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;

namespace A2v10.Xaml
{
	[ContentProperty("Content")]
	public class Html : Inline
	{
		public Object Content { get; set; }

		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var span = new TagBuilder("span", null, IsInGrid);
			onRender?.Invoke(span);
			MergeAttributes(span, context);

			var cbind = GetBinding(nameof(Content));
			if (cbind != null)
				span.MergeAttribute("v-html", $"$sanitize({cbind.GetPathFormat(context)})");

			span.RenderStart(context);
			if (Content != null && Content is String)
				context.Writer.Write(context.LocalizeCheckApostrophe(Content.ToString()));
			span.RenderEnd(context);
		}
	}
}

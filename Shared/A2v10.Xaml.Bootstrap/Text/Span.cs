// Copyright © 2021-2022 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;

namespace A2v10.Xaml.Bootstrap;

[ContentProperty("Content")]
public class Span : BsContentElement
{
	public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
	{
		if (SkipRender(context))
			return;

		var span = new TagBuilder("span");
		onRender?.Invoke(span);

		var bind = GetBinding(nameof(Content));
		if (bind != null)
			span.MergeAttribute("v-text", bind.GetPathFormat(context));
		span.RenderStart(context);
		if (!String.IsNullOrEmpty(Content))
			context.Writer.Write(context.LocalizeCheckApostrophe(Content));
		span.RenderEnd(context);
	}
}

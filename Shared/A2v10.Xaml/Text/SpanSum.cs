// Copyright © 2020 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;

namespace A2v10.Xaml
{
	[ContentProperty("Content")]
	public class SpanSum : Inline
	{
		public Object Content { get; set; }
		public Int32 Dir { get; set; }

		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var span = new TagBuilder("a2-span-sum");
			onRender?.Invoke(span);
			MergeAttributes(span, context);

			var cbind = GetBinding(nameof(Content));
			if (cbind != null)
				span.MergeAttribute(":content", cbind.GetPathFormat(context));
			else if (Content != null)
				RenderContent(context, Content);

			var dirBind = GetBinding(nameof(Dir));
			if (dirBind != null)
				span.MergeAttribute(":dir", dirBind.GetPath(context));
			else
				span.MergeAttribute(":dir", Dir.ToString());
			span.Render(context);
		}
	}
}

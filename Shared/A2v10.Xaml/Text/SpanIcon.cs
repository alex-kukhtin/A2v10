// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;
using A2v10.Infrastructure;

namespace A2v10.Xaml
{
	public class SpanIcon : Inline
	{
		public Icon Icon { get; set; }
		public Length Size { get; set; }
		public Boolean Gray { get; set; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var span = new TagBuilder("i", "ico", IsInGrid);
			if (!Block)
				span.AddCssClass("ico-inline");
			MergeAttributes(span, context);
			span.AddCssClassBool(Gray, "text-gray");
			var iconBind = GetBinding(nameof(Icon));
			if (iconBind != null)
				span.MergeAttribute(":class", iconBind.GetPathFormat(context));
			else if (Icon != Icon.NoIcon)
				span.MergeAttribute(":class", $"'ico-{Icon.ToString().ToKebabCase()}'");
			if (Size != null)
				span.MergeStyle("font-size", Size.Value);
			span.Render(context, TagRenderMode.Normal, addSpace: true);
		}
	}
}

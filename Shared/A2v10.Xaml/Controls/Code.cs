// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
	public class Code : ContentControl
	{
		public Boolean Multiline { get; set; }

		public Length Height { get; set; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var code = new TagBuilder(Multiline ? "pre" : "code", null, IsInGrid);
			onRender?.Invoke(code);
			if (Multiline)
				code.AddCssClass("pre-scrollable");
			if (Height != null)
				code.MergeStyle("max-height", Height.Value);
			code.AddCssClass("a2-code");
			MergeAttributes(code, context);
			code.RenderStart(context);
			RenderContent(context);
			code.RenderEnd(context);
		}
	}
}

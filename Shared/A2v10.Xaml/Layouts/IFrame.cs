// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
	public class IFrame : UIElementBase
	{

		public Size Size { get; set; }
		public String Source { get; set; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var div = new TagBuilder("iframe", "a2-iframe", IsInGrid);
			onRender?.Invoke(div);
			MergeAttributes(div, context, MergeAttrMode.Margin | MergeAttrMode.Visibility);
			div.MergeAttribute("frameborder", "0");
			if (Size != null)
			{
				if (!Size.Width.IsEmpty)
					div.MergeStyle("width", Size.Width.ToString());
				if (!Size.Height.IsEmpty)
				{
					div.MergeStyle("height", Size.Height.ToString());
				}
			}
			MergeBindingAttributeString(div, context, "src", nameof(Source), Source);
			div.RenderStart(context);
			div.RenderEnd(context);
		}
	}
}

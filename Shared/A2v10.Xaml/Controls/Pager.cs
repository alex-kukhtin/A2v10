// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
	public enum PagerStyle
	{
		Default,
		Rounded
	}

	public class Pager : UIElementBase
	{
		public Object Source { get; set; }

		public PagerStyle Style { get; set; }

		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			//<a2-pager :source = "Parent.pager" />
			var pager = new TagBuilder("a2-pager");
			if (Style != PagerStyle.Default)
				pager.AddCssClass(Style.ToString().ToLowerInvariant());
			MergeAttributes(pager, context, MergeAttrMode.Margin);
			onRender?.Invoke(pager);
			var source = GetBinding(nameof(Source));
			if (source == null)
				throw new XamlException("Pager has no Source binding");
			pager.MergeAttribute(":source", source.GetPath(context));
			pager.Render(context, TagRenderMode.Normal);
		}
	}
}

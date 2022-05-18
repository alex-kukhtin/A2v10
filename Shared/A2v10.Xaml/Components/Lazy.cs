// Copyright © 2015-2022 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;

namespace A2v10.Xaml
{
	[ContentProperty("Content")]
	public class Lazy : UIElementBase
	{
		public Object ItemsSource { get; set; }
		public Object Content { get; set; }

		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var isBind = GetBinding(nameof(ItemsSource));
			if (isBind == null)
				throw new XamlException("ItemsSource must be specified for Lazy component");

			var tag = new TagBuilder("div", null, IsInGrid);
			onRender?.Invoke(tag);

			MergeAttributes(tag, context);
			tag.MergeAttribute("v-lazy", isBind.GetPath(context));

			tag.RenderStart(context);
			RenderContent(context, Content);
			tag.RenderEnd(context);
		}
	}
}

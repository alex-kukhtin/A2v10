// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

using A2v10.Infrastructure;
using System;

namespace A2v10.Xaml;

public class TagsList : Container, ITableControl
{
	public String NameProperty { get; set; }
	public String ColorProperty { get; set; }

	public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
	{
		if (SkipRender(context))
			return;
		var list = new TagBuilder("a2-tags-list", null, IsInGrid);
		MergeAttributes(list, context);
		var isBind = GetBinding(nameof(ItemsSource));
		if (isBind != null)
			list.MergeAttribute(":items-source", isBind.GetPathFormat(context));
		list.MergeAttribute("content-prop", NameProperty);
		list.MergeAttribute("color-prop", ColorProperty);

		list.RenderStart(context);
		list.RenderEnd(context);
	}
}

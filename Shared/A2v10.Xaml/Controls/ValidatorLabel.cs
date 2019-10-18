// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
	public class ValidatorLabel : UIElement, ITableControl
	{

		public Object Value { get; set; }

		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			var tag = new TagBuilder("a2-static-validator", null, IsInGrid);
			onRender?.Invoke(tag);
			MergeAttributes(tag, context);
			MergeValueItemProp(tag, context, nameof(Value));
			tag.RenderStart(context);
			tag.RenderEnd(context);
		}
	}
}

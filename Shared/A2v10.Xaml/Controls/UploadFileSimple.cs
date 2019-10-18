// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
	public class UploadFileSimple : UIElementBase
	{
		public Object Value { get; set; }
		public Length Width { get; set; }

		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var tag = new TagBuilder("a2-simple-upload", null, IsInGrid);
			MergeAttributes(tag, context, MergeAttrMode.Visibility);
			if (Width != null)
				tag.MergeStyle("width", Width.Value);
			MergeValueItemProp(tag, context, nameof(Value));
			tag.Render(context);
		}
	}
}

// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
	public class UploadFile : UIElementBase
	{
		public Object Value { get; set; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var tag = new TagBuilder("a2-simple-upload");
			MergeAttributes(tag, context, MergeAttrMode.Visibility);
			MergeValueItemProp(tag, context, nameof(Value));
			tag.Render(context);
		}
	}
}

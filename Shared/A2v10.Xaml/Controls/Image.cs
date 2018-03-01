// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
	public class Image : UIElementBase
	{
		public Object Source { get; set; }
		public String Base { get; set; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			var tag = new TagBuilder("a2-image");
			if (onRender != null)
				onRender(tag);
			var contBind = GetBinding(nameof(Source));
			if (contBind == null)
				throw new XamlException("Source binding is required for the Image element");
			MergeValueItemProp(tag, context, nameof(Source));
			MergeBindingAttributeString(tag, context, "base", nameof(Base), Base);
			tag.Render(context);
		}
	}
}

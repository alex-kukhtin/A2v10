// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
	public class Image : UIElementBase
	{
		public Object Source { get; set; }
		public String Base { get; set; }

		public Length Width { get; set; }
		public Length Height { get; set; }

		public Boolean ReadOnly { get; set; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			var tag = new TagBuilder("a2-image", null, IsInGrid);
			if (onRender != null)
				onRender(tag);
			MergeAttributes(tag, context);
			var contBind = GetBinding(nameof(Source));
			if (contBind == null)
				throw new XamlException("Source binding is required for the Image element");
			if (Width != null)
				tag.MergeAttribute("width", Width.Value);
			if (Height != null)
				tag.MergeAttribute("height", Height.Value);
			MergeBindingAttributeBool(tag, context, ":read-only", nameof(ReadOnly), ReadOnly);
			MergeValueItemProp(tag, context, nameof(Source));
			MergeBindingAttributeString(tag, context, "base", nameof(Base), Base);
			tag.Render(context);
		}
	}
}

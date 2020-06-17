// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using A2v10.Infrastructure;

namespace A2v10.Xaml
{
	public class Image : UIElementBase
	{
		public Object Source { get; set; }
		public String Base { get; set; }

		public Length Width { get; set; }
		public Length Height { get; set; }

		public Boolean ReadOnly { get; set; }

		public Int32 Limit { get; set; }

		public String Placeholder { get; set; }

		public Icon Icon { get; set; }

		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var tag = new TagBuilder("a2-image", null, IsInGrid);
			onRender?.Invoke(tag);
			MergeAttributes(tag, context);
			var contBind = GetBinding(nameof(Source));
			if (contBind == null)
				throw new XamlException("Source binding is required for the Image element");
			if (Width != null)
				tag.MergeAttribute("width", Width.Value);
			if (Height != null)
				tag.MergeAttribute("height", Height.Value);
			if (Placeholder != null)
				MergeBindingAttributeString(tag, context, "placeholder", nameof(Placeholder), Placeholder);
			tag.MergeAttribute(":limit", Limit.ToString());

			if (Icon != Icon.NoIcon)
				tag.MergeAttribute("icon", Icon.ToString().ToKebabCase());

			MergeBindingAttributeBool(tag, context, ":read-only", nameof(ReadOnly), ReadOnly);
			MergeValueItemProp(tag, context, nameof(Source));
			MergeBindingAttributeString(tag, context, "base", nameof(Base), Base);
			tag.Render(context);
		}
	}

	public class FileImage : UIElementBase
	{
		public String Url { get; set; }
		public Length Width { get; set; }
		public Length Height { get; set; }
		public Object Value { get; set; }

		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var tag = new TagBuilder("a2-file-image", null, IsInGrid);
			onRender?.Invoke(tag);
			MergeAttributes(tag, context);
			MergeBindingAttributeString(tag, context, "url", nameof(Url), Url);
			var valBind = GetBinding(nameof(Value));
			if (valBind != null)
				tag.MergeAttribute(":value", valBind.GetPathFormat(context));
			else if (Value != null)
				tag.MergeAttribute("value", Value.ToString());
			if (Width != null)
				tag.MergeAttribute("width", Width.Value);
			if (Height != null)
				tag.MergeAttribute("height", Height.Value);
			tag.Render(context);
		}
	}
}

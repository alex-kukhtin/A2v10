// Copyright © 2023 Oleksandr Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml;

public class FilePreview : UIElementBase
{
	public String Url { get; set; }
	public Length Width { get; set; }
	public Length Height { get; set; }
	public Object Value { get; set; }

	public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
	{
		if (SkipRender(context))
			return;
		var tag = new TagBuilder("a2-file-preview", null, IsInGrid);
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

// Copyright © 2025-2026 Oleksandr Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml;

public class JsonView : UIElementBase
{
	public Object Source { get; set; }
    public Length Height { get; set; }
    public Length Width { get; set; }

    public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
	{
		if (SkipRender(context))
			return;
		var div = new TagBuilder("div", "a2-json-view");
		MergeAttributes(div, context);
        if (Height != null)
            div.MergeStyle("height", Height.Value);
        if (Width != null)
            div.MergeStyle("width", Width.Value);
        div.RenderStart(context);
		var json = new TagBuilder("a2-json-browser");
		var bind = GetBinding(nameof(Source));
		if (bind == null)
            throw new XamlException("JsonView. Binding 'Source' must be a Bind");
		json.MergeAttribute(":root", bind.GetPath(context));
		json.Render(context);
        div.RenderEnd(context);
	}
}

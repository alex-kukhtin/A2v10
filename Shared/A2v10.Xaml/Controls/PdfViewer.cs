// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml;

public class PdfViewer : UIElementBase
{
	public Size Size { get; set; }
	public String Source { get; set; }
	public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
	{
		if (SkipRender(context))
			return;
		var tag = new TagBuilder("object");
		tag.MergeAttribute("type", "application/pdf");
		if (Size != null)
		{
			if (!Size.Width.IsEmpty)
				tag.MergeAttribute("width", Size.Width.ToString());
			if (!Size.Height.IsEmpty)
			{
				tag.MergeAttribute("height", Size.Height.ToString());
			}
		}
		else
			tag.MergeAttribute("width", "100%");
		MergeBindingAttributeString(tag, context, "data", nameof(Source), Source);
		tag.Render(context);
	}
}

// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
	public class Attachments : UIElementBase
	{
		public String Url { get; set; }
		public String Accept { get; set; }

		public Object Source { get; set; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			var tag = new TagBuilder("a2-attachments", null, IsInGrid);
			onRender?.Invoke(tag);
			MergeAttributes(tag, context);
			var srcBind = GetBinding(nameof(Source));
			if (srcBind == null)
				throw new XamlException("Source binding is required for the Attachments element");
			MergeBindingAttributeString(tag, context, "url", nameof(Url), Url);
			tag.MergeAttribute(":source", srcBind.GetPath(context));
			MergeBindingAttributeString(tag, context, "accept", nameof(Accept), Accept);
			tag.Render(context);
		}
	}
}

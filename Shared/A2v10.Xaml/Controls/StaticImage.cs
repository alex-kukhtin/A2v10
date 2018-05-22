// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
	public class StaticImage : UIElementBase
	{
		public String Url { get; set; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			var img = new TagBuilder("a2-static-image", null, IsInGrid);
			onRender?.Invoke(img);
			MergeAttributes(img, context);
			var urlBind = GetBinding(nameof(Url));
			if (urlBind != null)
				img.MergeAttribute(":url", urlBind.GetPathFormat(context));
			else if (!String.IsNullOrEmpty(Url))
				img.MergeAttribute("url", Url);
			else
				throw new XamlException("Url is required for the StaticImage element");
			img.Render(context);
		}
	}
}

// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;

namespace A2v10.Xaml
{

	[ContentProperty("ItemTemplate")]
	public class ImageList : UIElement
	{
		public Object ItemsSource { get; set; }

		public Image ItemTemplate { get; set; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			var list = new TagBuilder("div", "image-list");
			var isBind = GetBinding(nameof(ItemsSource));
			if (isBind == null)
				throw new XamlException("ItemsSource binding is required for the ImageList element");
			MergeAttributes(list, context);
			String source = isBind.GetPath(context);
			list.RenderStart(context);
			TagBuilder itemTag = null;
			if (ItemTemplate != null)
			{
				using (new ScopeContext(context, "img"))
				{
					ItemTemplate.RenderElement(context, (tag) =>
					{
						tag.MergeAttribute("v-for", $"(img, imgIndex) in {source}");
						tag.MergeAttribute(":in-array", "true");
						tag.MergeAttribute(":key", "imgIndex");
						itemTag = tag;
					});
				}
				/* new element */
				var ni = new TagBuilder("a2-image");
				ni.MergeAttribute(":new-item", "true");
				ni.MergeAttribute(":source", source);
				ni.MergeAttribute("base", itemTag.GetAttribute("base"));
				ni.MergeAttribute("prop", itemTag.GetAttribute("prop"));
				ni.Render(context);
			}
			list.RenderEnd(context);
		}
	}
}

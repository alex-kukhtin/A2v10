// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
	public enum SeparatorMode
	{
		None,
		Before,
		After
	}

	public class MenuItem : CommandControl
	{
		public Icon Icon { get; set; }

		public SeparatorMode Separator { get; set; }

		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			if (Separator == SeparatorMode.Before)
			{
				var s = new TagBuilder("div", "divider");
				s.MergeAttribute("role", "separator");
				MergeAttributes(s, context, MergeAttrMode.Visibility);
				s.Render(context);
			}
			var mi = new TagBuilder("button", "dropdown-item");
			if (HasIcon)
			{
				MergeAttributes(mi, context, MergeAttrMode.NoContent);
				MergeDisabled(mi, context, nativeControl: true);
				mi.MergeAttribute("v-disable", String.Empty);
				mi.RenderStart(context);
				RenderIcon(context, Icon);
				var span = new TagBuilder("span");
				MergeAttributesBase(span, context, MergeAttrMode.Content); // skip command!
				span.RenderStart(context);
				RenderContent(context);
				span.RenderEnd(context);
				mi.RenderEnd(context);
			}
			else
			{
				MergeAttributes(mi, context, MergeAttrMode.All);
				MergeDisabled(mi, context, nativeControl: true);
				mi.MergeAttribute("v-disable", String.Empty);
				mi.RenderStart(context);
				RenderContent(context);
				mi.RenderEnd(context);
			}

			if (Separator == SeparatorMode.After)
			{
				var s = new TagBuilder("div", "divider");
				s.MergeAttribute("role", "separator");
				MergeAttributes(s, context, MergeAttrMode.Visibility);
				s.Render(context);
			}

		}

		Boolean HasIcon => GetBinding(nameof(Icon)) != null || Icon != Icon.NoIcon;
	}
}

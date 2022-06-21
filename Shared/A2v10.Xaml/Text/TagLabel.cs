// Copyright © 2015-2022 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;

namespace A2v10.Xaml
{

	public enum TagLabelStyle
	{
		Default,
		Success,
		Green,
		Warning,
		Orange,
		Info,
		Cyan,
		Danger,
		Red,
		Error,
		Purple,
		Pink,
		Gold,
		Blue,
		Salmon,
		Seagreen,
		Tan,
		Magenta,
		LightGray,
		Olive,
		Teal
	}

	[ContentProperty("Content")]
	public class TagLabel : Inline
	{
		public String Content { get; set; }
		public TagLabelStyle Style { get; set; }

		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var span = new TagBuilder("span", "tag-label", IsInGrid);
			MergeAttributes(span, context);

			var cbind = GetBinding(nameof(Content));
			if (cbind != null)
				span.MergeAttribute("v-text", cbind.GetPathFormat(context));

			var cStyle = GetBinding(nameof(Style));
			if (cStyle != null)
			{
				span.MergeAttribute(":class", cStyle.GetPathFormat(context));
			}
			else if (Style != TagLabelStyle.Default)
			{
				span.AddCssClass(Style.ToString().ToLowerInvariant());
			}

			span.RenderStart(context);
			if (Content is String)
				context.Writer.Write(context.LocalizeCheckApostrophe(Content.ToString()));
			span.RenderEnd(context);
		}
	}
}

// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
	public class FieldSet : Container, ITableControl
	{
		public Orientation Orientation { get; set; }

		public String Title { get; set; }

		public Popover Hint { get; set; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var div = new TagBuilder("fieldset", "field-set", IsInGrid);
			onRender?.Invoke(div);
			MergeAttributes(div, context);
			div.AddCssClass(Orientation.ToString().ToLowerInvariant());
			div.RenderStart(context);
			RenderTitle(context);
			RenderChildren(context, (ch) =>
			{
				ch.AddCssClass("field-set-item");
			});
			div.RenderEnd(context);
		}

		void RenderTitle(RenderContext context)
		{
			var titleBind = GetBinding(nameof(Title));
			if (titleBind != null || Title != null)
			{
				var title = new TagBuilder("legend");
				title.RenderStart(context);
				var span = new TagBuilder("span");
				if (titleBind != null)
					span.MergeAttribute("v-text", titleBind.GetPathFormat(context));
				span.RenderStart(context);
				if (Title != null)
				{
					context.Writer.Write(context.LocalizeCheckApostrophe(Title));
				}
				span.RenderEnd(context);
				RenderHint(context);
				title.RenderEnd(context);
			}
		}

		void RenderHint(RenderContext context)
		{
			if (Hint == null)
				return;
			if (Hint.Icon == Icon.NoIcon)
				Hint.Icon = Icon.Help;
			var tag = new TagBuilder("span");
			tag.RenderStart(context);
			Hint.RenderElement(context, (t) =>
			{
				t.AddCssClass("hint");
			});
			tag.RenderEnd(context);
		}
	}
}

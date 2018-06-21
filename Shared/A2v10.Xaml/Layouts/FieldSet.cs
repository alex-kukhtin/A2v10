// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
	public class FieldSet : Container, ITableControl
	{
		public Orientation Orientation { get; set; }

		public String Title { get; set; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
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
				if (titleBind != null)
					title.MergeAttribute("v-text", titleBind.GetPathFormat(context));
				title.RenderStart(context);
				if (Title != null)
				{
					context.Writer.Write(context.Localize(Title));
				}
				title.RenderEnd(context);
			}
		}
	}
}

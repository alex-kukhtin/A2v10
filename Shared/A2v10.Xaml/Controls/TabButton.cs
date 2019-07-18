// Copyright © 2019 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Windows.Markup;

namespace A2v10.Xaml
{
	public class TabButtonCollection : List<TabButton>
	{

	}

	[ContentProperty("Content")]
	public class TabButton : UIElementBase
	{
		public Object Content { get; set; }

		public String ActiveValue { get; set; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			throw new NotImplementedException();
		}

		internal void RenderMe(RenderContext context, String valuePath)
		{
			if (SkipRender(context))
				return;

			var btn = new TagBuilder("a", "a2-tab-button");

			var activeValueArg = $"'{ActiveValue}'";
			var avBind = GetBinding(nameof(ActiveValue));
			if (avBind != null)
				activeValueArg = avBind.GetPathFormat(context);

			MergeAttributes(btn, context);
			if (valuePath != null)
			{
				btn.MergeAttribute(":class", $"{{'active': {activeValueArg} == {valuePath}}}");
				btn.MergeAttribute("@click.prevent", $"{valuePath}={activeValueArg}");
			}

			btn.RenderStart(context);
			var cntBind = GetBinding(nameof(Content));
			if (cntBind != null)
			{
				var span = new TagBuilder("span");
				span.MergeAttribute("v-text", cntBind.GetPathFormat(context));
				span.Render(context);
			}
			else if (Content is UIElementBase contUi)
				contUi.RenderElement(context);
			else if (Content != null)
				context.Writer.Write(context.Localize(Content.ToString()));
			btn.RenderEnd(context);
		}
	}
}

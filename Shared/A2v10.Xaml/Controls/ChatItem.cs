// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Windows.Markup;

namespace A2v10.Xaml
{

	[ContentProperty("Content")]
	public class ChatItem : UIElementBase
	{
		public String Content { get; set; }
		public Object Time { get; set; }
		public String User { get; set; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var item = new TagBuilder("div", "chat-item");
			onRender?.Invoke(item);
			MergeAttributes(item, context, MergeAttrMode.Visibility);
			item.RenderStart(context);
			TagBuilder.RenderSpanText(context, "chat-user", GetBinding(nameof(User)));
			TagBuilder.RenderSpanText(context, "chat-time", GetBinding(nameof(Time)));

			TagBuilder cont = new TagBuilder("span", "chat-body");
			var contBind = GetBinding(nameof(Content));
			if (contBind != null)
				cont.MergeAttribute("v-text", contBind.GetPathFormat(context));
			cont.RenderStart(context);
			RenderContent(context, Content);
			cont.RenderEnd(context);

			item.RenderEnd(context);
		}
	}
}

// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;

namespace A2v10.Xaml
{

	[ContentProperty("Content")]
	public class ChatItem : UIElementBase
	{
		public String Content { get; set; }
		public String Time { get; set; }
		public String User { get; set; }

		Lazy<UIElementCollection> _addOns = new Lazy<UIElementCollection>();

		public UIElementCollection AddOns { get { return _addOns.Value; } }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var item = new TagBuilder("div", "chat-item");
			onRender?.Invoke(item);
			MergeAttributes(item, context, MergeAttrMode.Visibility);
			item.RenderStart(context);

			var h = new TagBuilder("div", "chat-header");
			h.RenderStart(context);
			TagBuilder.RenderSpanText(context, "chat-user", GetBinding(nameof(User)), User);
			TagBuilder.RenderSpanText(context, "chat-time", GetBinding(nameof(Time)), Time);
			RenderAddOns(context);
			h.RenderEnd(context);

			TagBuilder cont = new TagBuilder("span", "chat-body");
			var contBind = GetBinding(nameof(Content));
			if (contBind != null)
				cont.MergeAttribute("v-text", contBind.GetPathFormat(context));
			cont.RenderStart(context);
			RenderContent(context, Content);
			cont.RenderEnd(context);
			item.RenderEnd(context);
		}

		internal void RenderAddOns(RenderContext context)
		{
			if (!_addOns.IsValueCreated)
				return;
			foreach (var ctl in AddOns)
			{
				var wrap = new TagBuilder("span", "chat-add-on");
				wrap.RenderStart(context);
				ctl.RenderElement(context, (tag) =>
				{
					tag.AddCssClass("add-on");
					tag.MergeAttribute("tabindex", "-1");
				});
				wrap.RenderEnd(context);
			}
		}
	}
}

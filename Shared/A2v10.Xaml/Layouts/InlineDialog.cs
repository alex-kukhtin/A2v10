// Copyright © 2020 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
	public class InlineDialog : Container
	{
		public String Id { get; set; }

		public String Title { get; set; }

		public UIElementCollection Buttons { get; set; } = new UIElementCollection();

		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (String.IsNullOrEmpty(Id))
				throw new XamlException("Id is required for Inline Dialog");

			var dlg = new TagBuilder("a2-inline-dialog");
			onRender?.Invoke(dlg);
			dlg.AddCssClassBoolNo(UserSelect, "user-select");
			dlg.MergeAttribute("dialog-id", Id);
			MergeBindingAttributeString(dlg, context, "dialog-title", nameof(Title), Title);

			dlg.RenderStart(context);
			var m = new TagBuilder("div", "modal");
			m.RenderStart(context);
			RenderHeader(context);
			var mc = new TagBuilder("div", "modal-content");
			mc.RenderStart(context);
			RenderChildren(context);
			mc.RenderEnd(context);
			RenderFooter(context);
			m.RenderEnd(context);
			dlg.RenderEnd(context);

		}

		void RenderHeader(RenderContext context)
		{
			var header = new TagBuilder("div", "modal-header");
			header.MergeAttribute("v-drag-window", String.Empty);
			header.RenderStart(context);
			var hdr = GetBinding(nameof(Title));
			if ((hdr != null) || (Title != null))
			{
				var span = new TagBuilder("span");
				if (hdr != null)
					span.MergeAttribute("v-text", hdr.GetPathFormat(context));
				else if (Title != null)
					span.SetInnerText(context.LocalizeCheckApostrophe(Title));
				span.Render(context);
			}
			var close = new TagBuilder("button", "btnclose");
			close.MergeAttribute("@click.prevent", $"$inlineClose('{Id}', false)");
			close.SetInnerText("&#x2715;");
			close.Render(context);
			header.RenderEnd(context);
		}

		protected virtual void RenderFooter(RenderContext context)
		{
			if (Buttons.Count == 0)
				return;
			var footer = new TagBuilder("div", "modal-footer");
			footer.RenderStart(context);

			foreach (var b in Buttons)
				b.RenderElement(context);

			footer.RenderEnd(context);
		}

		protected override void OnEndInit()
		{
			base.OnEndInit();
			foreach (var b in Buttons)
				b.SetParent(this);
		}
	}
}

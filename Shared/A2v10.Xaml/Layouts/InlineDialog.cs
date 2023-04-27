// Copyright © 2020-2023 Oleksandr Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml;

public class InlineDialog : Container
{
	public String Id { get; set; }

	public String Title { get; set; }
	public Length Width { get; set; }
	public Boolean NoClose { get; set; }
	public Boolean ShowWaitCursor { get; set; }
	public Boolean Overflow { get; set; }

	public UIElementCollection Buttons { get; set; } = new UIElementCollection();

	public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
	{
		if (String.IsNullOrEmpty(Id))
			throw new XamlException("Id is required for Inline Dialog");

		var dlg = new TagBuilder("a2-inline-dialog");
		onRender?.Invoke(dlg);
		dlg.AddCssClassBoolNo(UserSelect, "user-select");
		dlg.MergeAttribute("dialog-id", Id);
		if (NoClose)
			dlg.MergeAttribute(":no-close", "true");
		MergeBindingAttributeString(dlg, context, "dialog-title", nameof(Title), Title);
		if (Width != null)
			dlg.MergeAttribute("width", Width.Value);

		dlg.RenderStart(context);

		var m = new TagBuilder("div", "modal");
		m.RenderStart(context);

		if (ShowWaitCursor)
			new TagBuilder("wait-cursor", "dialog")
				.MergeAttribute(":ready", "$data.$ready")
				.Render(context, TagRenderMode.Normal);

		RenderHeader(context);
		RenderLoadIndicator(context);

		var mc = new TagBuilder("div", "modal-content");
		MergeAttributes(mc, context, MergeAttrMode.Margin);
		mc.AddCssClassBool(Overflow, "overflow");

		mc.RenderStart(context);
		RenderChildren(context);
		mc.RenderEnd(context);
		RenderFooter(context);
		m.RenderEnd(context);
		dlg.RenderEnd(context);

	}

	void RenderLoadIndicator(RenderContext context)
	{
		new TagBuilder("div", "load-indicator")
			.MergeAttribute("v-show", "$isLoading")
			.Render(context);
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
		if (NoClose)
			close.MergeAttribute("disabled", "true");
		else
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

// Copyright © 2015-2022 Alex Kukhtin. All rights reserved.

using System;
using System.Text;
using A2v10.Infrastructure;

namespace A2v10.Xaml;

public enum DialogSize
{
	Default = 0,
	Small = 1,
	Medium = Default,
	Large = 2,
	Max = 3
}

public enum DialogPlacement
{
	Default,
	SideBarRight,
	SideBarLeft,
	FullScreen
}

public class Dialog : RootContainer, ISupportTwoPhaseRendering
{
	public String Title { get; set; }
	public String HelpUrl { get; set; }
	public String TestId { get; set; }
	public String SaveEvent { get; set; }

	public UIElementBase TitleInfo { get; set; }

	public DialogSize Size { get; set; }
	public Length Width { get; set; }
	public Length MinWidth { get; set; }
	public Length Height { get; set; }
	public String CanCloseDelegate { get; set; }
	public Boolean AlwaysOk { get; set; }
	public UIElementBase Taskpad { get; set; }
	public Boolean ShowWaitCursor { get; set; }
	public BackgroundStyle Background { get; set; }
	public Boolean Maximize { get; set; }
	public Boolean ButtonOnTop { get; set; }
	public Boolean Overflow { get; set; }
	public DialogPlacement Placement { get; set; }
	public UIElementCollection Buttons { get; set; } = new UIElementCollection();

	public CollectionView CollectionView { get; set; }

	protected virtual void OnCreateContent(TagBuilder tag)
	{
	}

	internal Boolean IsContentIsIFrame => Children?.Count == 1 && Children[0] is IFrame;

	String GetControllerAttributes()
	{
		if (String.IsNullOrEmpty(CanCloseDelegate) && !AlwaysOk && String.IsNullOrEmpty(SaveEvent))
			return null;
		var opts = new StringBuilder("{");
		if (!String.IsNullOrEmpty(CanCloseDelegate))
			opts.Append($"'canClose': '{CanCloseDelegate}',");
		if (AlwaysOk)
			opts.Append("'alwaysOk': true,");
		if (!String.IsNullOrEmpty(SaveEvent))
			opts.Append($"'saveEvent': '{SaveEvent}',");
		opts.RemoveTailComma();
		opts.Append("}");
		return opts.ToString();
	}

	public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
	{
		var dialog = new TagBuilder("div", "modal");
		dialog.MergeAttribute("id", context.RootId);
		dialog.MergeAttribute("v-cloak", String.Empty);
		dialog.AddCssClassBoolNo(UserSelect, "user-select");
		dialog.MergeAttribute("data-controller-attr", GetControllerAttributes());
		dialog.AddCssClassBool(Maximize, "maximize");
		dialog.AddCssClassBool(ButtonOnTop, "button-on-top");

		if (!String.IsNullOrEmpty(TestId) && context.IsDebugConfiguration)
			dialog.MergeAttribute("test-id", TestId);


		if (Maximize)
			dialog.MergeAttribute("v-maximize", "true");
		else
			SetSize(dialog);
		if (Placement != DialogPlacement.Default)
			dialog.MergeAttribute("v-modal-placement", $"'{Placement.ToString().ToKebabCase()}'");

		dialog.RenderStart(context);

		if (ShowWaitCursor)
			new TagBuilder("wait-cursor", "dialog")
				.MergeAttribute(":ready", "$data.$ready")
				.Render(context, TagRenderMode.Normal);

		if (CollectionView != null)
			CollectionView.RenderStart(context, tag =>
			{
				tag.AddCssClass("cw-dialog");
			});

		RenderHeader(context);
		RenderLoadIndicator(context);

		var content = new TagBuilder("div", "modal-content");
		OnCreateContent(content);
		if (Height != null)
			content.MergeStyle("min-height", Height.Value);
		if (Padding != null)
			Padding.MergeStyles("padding", content);
		content.AddCssClassBool(IsContentIsIFrame, "content-iframe"); // bug fix (3px height)
		if (Background != BackgroundStyle.Default)
			content.AddCssClass("background-" + Background.ToString().ToKebabCase());
		content.AddCssClassBool(Overflow, "overflow");
		content.RenderStart(context);
		if (Taskpad != null)
		{
			var gridContent = new TagBuilder("div", "dialog-grid-content");
			var grid = new TagBuilder("div", "dialog-grid");
			if (Taskpad is Taskpad tp && tp.Width != null)
			{
				if (tp.Position == TaskpadPosition.Left)
				{
					grid.MergeStyle("grid-template-columns", $"{tp.Width.Value} 1fr");
					gridContent.MergeStyle("grid-column", "2");
				}
				else
				{
					grid.MergeStyle("grid-template-columns", $"1fr {tp.Width.Value}");
					gridContent.MergeStyle("grid-column", "1");
				}
			}
			grid.RenderStart(context);
			gridContent.RenderStart(context);
			RenderChildren(context);
			gridContent.RenderEnd(context);
			Taskpad.RenderElement(context);
			grid.RenderEnd(context);
		}
		else
		{
			RenderChildren(context);
		}

		content.RenderEnd(context);

		RenderFooter(context);

		if (CollectionView != null)
			CollectionView.RenderEnd(context);

		RenderAccelCommands(context);
		RenderContextMenus();

		dialog.RenderEnd(context);
	}

	public override void RenderChildren(RenderContext context, Action<TagBuilder> onRenderStatic = null)
	{
		// static without wrapper
		foreach (var c in Children)
			c.RenderElement(context);
	}


	void SetSize(TagBuilder dialog)
	{
		if ((Size == DialogSize.Default || Size == DialogSize.Medium) && (Width == null))
			return;
		var sb = new StringBuilder("{");
		if (Size == DialogSize.Large)
			sb.Append("cssClass:'modal-large',");
		else if (Size == DialogSize.Small)
			sb.Append("cssClass:'modal-small',");
		if (Width != null)
			sb.Append($"width:'{Width.Value}',");
		if (MinWidth != null)
			sb.Append($"minWidth:'{MinWidth.Value}',");
		sb.RemoveTailComma();
		sb.Append("}");
		dialog.MergeAttribute("v-modal-width", sb.ToString());
	}

	void RenderHeader(RenderContext context)
	{
		var header = new TagBuilder("div", "modal-header");
		if (!Maximize)
			header.MergeAttribute("v-drag-window", String.Empty);
		header.RenderStart(context);
		var hdr = GetBinding(nameof(Title));
		if ((hdr != null) || (Title != null))
		{
			var span = new TagBuilder("span", "modal-title");
			if (hdr != null)
				span.MergeAttribute("v-text", hdr.GetPathFormat(context));
			else if (Title != null)
				span.SetInnerText(context.LocalizeCheckApostrophe(Title));
			span.Render(context);
		}
		if (TitleInfo != null)
		{
			var span = new TagBuilder("span", "modal-title-info");
			span.RenderStart(context);
			TitleInfo.RenderElement(context, null);
			span.RenderEnd(context);
		}
		var close = new TagBuilder("button", "btnclose");
		close.MergeAttribute("tabindex", "-1");
		close.MergeAttribute("@click.prevent", "$modalClose(false)");
		close.SetInnerText("&#x2715;");
		close.Render(context);

		RenderHelp(context);

		header.RenderEnd(context);
	}

	void RenderLoadIndicator(RenderContext context)
	{
		new TagBuilder("div", "load-indicator")
			.MergeAttribute("v-show", "$isLoading")
			.Render(context);
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

	protected Boolean HasHelp => GetBinding(nameof(HelpUrl)) != null || !String.IsNullOrEmpty(HelpUrl);

	protected virtual void RenderHelp(RenderContext context)
	{
		if (!HasHelp)
			return;
		var ha = new TagBuilder("a", "btn-help");
		ha.MergeAttribute("rel", "help");
		ha.MergeAttribute("title", context.Localize("@[Help]"));

		var hbind = GetBinding(nameof(HelpUrl));
		if (hbind != null)
		{
			String hpath = hbind.GetPathFormat(context);
			ha.MergeAttribute("@click.stop.prevent", $"$showHelp({hpath})");
			ha.MergeAttribute(":href", $"$helpHref({hpath})");
		}
		else if (!String.IsNullOrEmpty(HelpUrl))
		{
			ha.MergeAttribute("@click.stop.prevent", $"$showHelp('{HelpUrl}')");
			ha.MergeAttribute(":href", $"$helpHref('{HelpUrl}')");
		}
		ha.RenderStart(context);
		new TagBuilder("i", "ico ico-help")
			.Render(context);
		//context.Writer.Write(context.Localize("@[Help]"));
		ha.RenderEnd(context);
	}

	public void RenderSecondPhase(RenderContext context)
	{
		if (Children.Count != 1)
			throw new XamlException("Invalid dialog for two-phase rendering");
		if (!(Children[0] is EUSignFrame eusignFrame))
			throw new XamlException("Invalid dialog for two-phase rendering");
		eusignFrame.RenderTwoPhaseContent(context);
	}

	protected override void OnEndInit()
	{
		base.OnEndInit();
		CollectionView?.SetParent(this);
		Taskpad?.SetParent(this);
		TitleInfo?.SetParent(this);
		foreach (var b in Buttons)
			b.SetParent(this);
		if (Size == DialogSize.Max)
			Maximize = true;
	}

	public override void OnSetStyles(RootContainer root)
	{
		base.OnSetStyles(root);
		CollectionView?.OnSetStyles(root);
		Taskpad?.OnSetStyles(root);
		TitleInfo?.OnSetStyles(root);
		foreach (var b in Buttons)
			b.OnSetStyles(this);
	}

	public override void OnDispose()
	{
		base.OnDispose();
		CollectionView?.OnDispose();
		Taskpad?.OnDispose();
		TitleInfo?.OnDispose();
		foreach (var b in Buttons)
			b.OnDispose();
	}
	protected override T FindInside<T>()
	{
		if (this is T elemT)
			return elemT;
		else if (CollectionView is T collectionView)
			return collectionView;
		else if (Taskpad is T taskpad)
			return taskpad;
		return null;
	}
}

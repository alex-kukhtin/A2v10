// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Text;
using A2v10.Infrastructure;

namespace A2v10.Xaml
{
	public enum DialogSize
	{
		Default = 0,
		Small = 1,
		Medium = Default,
		Large = 2,
	}

	public class Dialog : RootContainer, ISupportTwoPhaseRendering
	{
		public String Title { get; set; }
		public String HelpUrl { get; set; }

		public DialogSize Size { get; set; }
		public Length Width { get; set; }
		public Length Height { get; set; }
		public String CanCloseDelegate { get; set; }
		public Boolean AlwaysOk { get; set; }

		public UIElementCollection Buttons { get; set; } = new UIElementCollection();

		internal virtual void OnCreateContent(TagBuilder tag)
		{
		}

		internal Boolean IsContentIsIFrame => Children?.Count == 1 && Children[0] is IFrame;

		String GetControllerAttributes()
		{
			if (String.IsNullOrEmpty(CanCloseDelegate) && !AlwaysOk)
				return null;
			var opts = new StringBuilder("{");
			if (!String.IsNullOrEmpty(CanCloseDelegate))
				opts.Append($"'canClose': '{CanCloseDelegate}',");
			if (AlwaysOk)
				opts.Append("'alwaysOk': true");
			opts.RemoveTailComma();
			opts.Append("}");
			return opts.ToString();
		}

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			var dialog = new TagBuilder("div", "modal");
			dialog.MergeAttribute("id", context.RootId);
			dialog.MergeAttribute("v-cloak", String.Empty);
			dialog.AddCssClassBoolNo(UserSelect, "user-select");

			dialog.MergeAttribute("data-controller-attr", GetControllerAttributes());

			SetSize(dialog);

			dialog.RenderStart(context);

			RenderHeader(context);
			RenderLoadIndicator(context);

			var content = new TagBuilder("div", "modal-content");
			OnCreateContent(content);
			if (Height != null)
				content.MergeStyle("min-height", Height.Value);
			if (Padding != null)
				Padding.MergeStyles("padding", content);
			content.AddCssClassBool(IsContentIsIFrame, "content-iframe"); // bug fix (3px height)
			content.RenderStart(context);
			RenderChildren(context);
			content.RenderEnd(context);

			RenderFooter(context);

			dialog.RenderEnd(context);
		}


		internal override void RenderChildren(RenderContext context, Action<TagBuilder> onRenderStatic = null)
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
			sb.RemoveTailComma();
			sb.Append("}");
			dialog.MergeAttribute("v-modal-width", sb.ToString());
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
					span.SetInnerText(context.Localize(Title));
				span.Render(context);
			}
			var close = new TagBuilder("button", "btnclose");
			close.MergeAttribute("@click.prevent", "$modalClose(false)");
			close.SetInnerText("&#x2715;");
			close.Render(context);

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
			if (Buttons.Count == 0 && !HasHelp)
				return;
			var footer = new TagBuilder("div", "modal-footer");
			footer.RenderStart(context);

			RenderHelp(context);
			foreach (var b in Buttons)
				b.RenderElement(context);

			footer.RenderEnd(context);
		}

		protected Boolean HasHelp => GetBinding(nameof(HelpUrl)) != null || !String.IsNullOrEmpty(HelpUrl);

		protected virtual void RenderHelp(RenderContext context)
		{
			if (!HasHelp)
				return;
			//<a class="btn-help"><i class="ico ico-help"></i>Справка</a>
			var ha = new TagBuilder("a", "btn-help");
			// TODO: Help path
			var hbind = GetBinding(nameof(HelpUrl));
			if (hbind != null)
			{
				String hpath = hbind.GetPathFormat(context);
				ha.MergeAttribute("@click.prevent", $"$showHelp({hpath})");
				ha.MergeAttribute(":href", $"$helpHref({hpath})");
			}
			else if (!String.IsNullOrEmpty(HelpUrl))
			{
				ha.MergeAttribute("@click.prevent", $"$showHelp('{HelpUrl}')");
				ha.MergeAttribute(":href", $"$helpHref('{HelpUrl}')");
			}
			ha.RenderStart(context);
			new TagBuilder("i", "ico ico-help")
				.Render(context);
			context.Writer.Write(context.Localize("@[Help]"));
			ha.RenderEnd(context);
			new TagBuilder("div", "aligner").Render(context);
		}

		public void RenderSecondPhase(RenderContext context)
		{
			if (Children.Count != 1)
				throw new XamlException("Invalid dialog for two-phase rendering");
			if (!(Children[0] is EUSignFrame eusignFrame))
				throw new XamlException("Invalid dialog for two-phase rendering");
			eusignFrame.RenderTwoPhaseContent(context);
		}
	}
}

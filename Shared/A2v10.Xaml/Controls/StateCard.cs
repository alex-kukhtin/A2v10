
using System;
using System.Windows.Markup;

namespace A2v10.Xaml
{
	public enum CardStyle
	{
		Default,
		Yellow,
		Green,
		Red,
		Cyan,
		Primary
	}

	[ContentProperty("Content")]
	public class StateCard : UiContentElement
	{
		public Object Header { get; set; }
		public Object Footer { get; set; }
		public Object Text { get; set; }
		public CardStyle Style {get; set;}
		public Boolean Compact { get; set; }
		public Length MinWidth { get; set; }

		public ShadowStyle DropShadow { get; set; }

		public Icon Icon { get; set; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var panel = new TagBuilder("div", "a2-state-card", IsInGrid);
			onRender?.Invoke(panel);
			MergeAttributes(panel, context);
			if (MinWidth != null)
				panel.MergeStyleUnit("min-width", MinWidth.Value);

			if (DropShadow != ShadowStyle.None)
			{
				panel.AddCssClass("drop-shadow");
				panel.AddCssClass(DropShadow.ToString().ToLowerInvariant());
			}
			if (Style != CardStyle.Default)
			{
				panel.AddCssClass("a2-state-card-styled");
				panel.AddCssClass("a2-state-card-" + Style.ToString().ToLowerInvariant());
			}
			panel.AddCssClassBool(Compact, "compact");
			panel.RenderStart(context);
			if (HasHeader)
				RenderHeader(context);
			if (HasText)
				RenderText(context);
			if (HasFooter)
				RenderFooter(context);
			RenderIcon(context, Icon, "a2-card-icon");
			RenderContent(context);
			panel.RenderEnd(context);
		}

		Boolean HasHeader => GetBinding(nameof(Header)) != null || Header != null;
		Boolean HasFooter => GetBinding(nameof(Footer)) != null || Footer != null;
		Boolean HasText => GetBinding(nameof(Text)) != null || Text != null;

		void RenderHeader(RenderContext context)
		{
			var tag = new TagBuilder("div", "a2-state-card-header");
			var bind = GetBinding(nameof(Header));
			if (bind != null)
				tag.MergeAttribute("v-text", bind.GetPathFormat(context));
			tag.RenderStart(context);
			if (Header is String headerString)
				context.Writer.Write(headerString);
			else if (Header is UIElementBase headerElement)
				headerElement.RenderElement(context);
			tag.RenderEnd(context);
		}

		void RenderText(RenderContext context)
		{
			var tag = new TagBuilder("div", "a2-state-card-text");
			var bind = GetBinding(nameof(Text));
			if (bind != null)
				tag.MergeAttribute("v-text", bind.GetPathFormat(context));
			tag.RenderStart(context);
			if (Text is String textString)
				context.Writer.Write(textString);
			else if (Text is UIElementBase textElement)
				textElement.RenderElement(context);
			tag.RenderEnd(context);

		}

		void RenderFooter(RenderContext context)
		{
			var tag = new TagBuilder("div", "a2-state-card-footer");
			var bind = GetBinding(nameof(Footer));
			if (bind != null)
				tag.MergeAttribute("v-text", bind.GetPathFormat(context));
			tag.RenderStart(context);
			if (Footer is String footerString)
				context.Writer.Write(footerString);
			else if (Footer is UIElementBase footerElement)
				footerElement.RenderElement(context);
			tag.RenderEnd(context);
		}
	}
}

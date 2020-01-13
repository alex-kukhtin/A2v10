// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;

namespace A2v10.Xaml
{
	[ContentProperty("Content")]
	public class Label : UIElement
	{
		public String Content { get; set; }
		public TextAlign Align { get; set; }
		public Boolean Required { get; set; }
		public ControlSize Size { get; set; }

		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var label = new TagBuilder("div", "a2-label", IsInGrid);
			onRender?.Invoke(label);

			var contBind = GetBinding(nameof(Content));
			if (contBind != null)
				label.MergeAttribute("v-text", contBind.GetPathFormat(context));

			MergeAttributes(label, context);
			if (Align != TextAlign.Left)
				label.AddCssClass("text-" + Align.ToString().ToLowerInvariant());
			label.AddCssClassBool(Required, "required");

			AddSize(label);
			label.RenderStart(context);

			if (Content != null)
				context.Writer.Write(context.LocalizeCheckApostrophe(Content.ToString()));

			label.RenderEnd(context);
		}

		void AddSize(TagBuilder tag)
		{
			switch (Size)
			{
				case ControlSize.Large:
					tag.AddCssClass("lg");
					break;
				case ControlSize.Default:
				case ControlSize.Normal:
					break;
				default:
					throw new XamlException("Only ControlSize.Normal or ControlSize.Large are supported for the TextBox");
			}
		}

	}
}

// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

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

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var label = new TagBuilder("div", "a2-label", IsInGrid);

            var contBind = GetBinding(nameof(Content));
            if (contBind != null)
                label.MergeAttribute("v-text", contBind.GetPathFormat(context));

            MergeAttributes(label, context);
            if (Align != TextAlign.Left)
                label.AddCssClass("text-" + Align.ToString().ToLowerInvariant());
            label.AddCssClassBool(Required, "required");

            label.RenderStart(context);

            if (Content != null)
                context.Writer.Write(context.Localize(Content.ToString()));

            label.RenderEnd(context);
        }
    }
}

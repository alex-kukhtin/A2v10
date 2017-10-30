// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;

namespace A2v10.Xaml
{
    [ContentProperty("Content")]
    public class Hyperlink : Inline
    {
        public Object Content { get; set; }

        public ControlSize Size { get; set; }

        public Icon Icon { get; set; }

        public Command Command { get; set; }


        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var tag = new TagBuilder("a", "a2-hyperlink a2-inline");
            if (onRender != null)
                onRender(tag);
            MergeAttributes(tag, context);
            MergeCommandAttribute(tag, context);

            if (Size != ControlSize.Default)
            {
                switch (Size)
                {
                    case ControlSize.Small:
                        tag.AddCssClass("small");
                        break;
                    default:
                        throw new XamlException("Only ControlSize.Small is supported for the Hyperlink");
                }
            }

            tag.RenderStart(context);

            RenderIcon(context, Icon);
            var cbind = GetBinding(nameof(Content));
            if (cbind != null)
            {
                new TagBuilder("span")
                    .MergeAttribute("v-text", cbind.GetPathFormat(context))
                    .Render(context);
            } else if (Content is UIElementBase)
            {
                (Content as UIElementBase).RenderElement(context);
            }
            else if (Content != null)
            {
                context.Writer.Write(Content.ToString());
            }
            tag.RenderEnd(context);
        }
    }
}

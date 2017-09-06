using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Markup;

namespace A2v10.Xaml
{
    [ContentProperty("Content")]
    public class Hyperlink : Inline
    {
        public Object Content { get; set; }

        public Icon Icon { get; set; }

        public Command Command { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var tag = new TagBuilder("a");
            if (onRender != null)
                onRender(tag);
            MergeCommandAttribute(tag, context);

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

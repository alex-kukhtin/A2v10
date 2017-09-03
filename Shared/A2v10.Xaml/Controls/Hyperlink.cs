using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml
{
    public class Hyperlink : CommandControl
    {
        public Icon Icon { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var tag = new TagBuilder("a");
            if (onRender != null)
                onRender(tag);
            MergeAttributes(tag, context);
            tag.RenderStart(context);
            RenderIcon(context, Icon);
            RenderContent(context);
            tag.RenderEnd(context);
        }
    }
}

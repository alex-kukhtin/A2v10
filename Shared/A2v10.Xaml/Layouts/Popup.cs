using A2v10.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml
{
    public class Popup : RootContainer
    {
        public Width Width { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var tag = new TagBuilder("div", "a2-popup");
            tag.MergeAttribute("id", context.RootId);
            if (Width != null)
                tag.MergeStyle("width", Width.ToString());
            tag.RenderStart(context);
            RenderChildren(context);
            tag.RenderEnd(context);
        }
    }
}

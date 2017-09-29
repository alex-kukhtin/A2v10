using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml
{
    public class Taskpad : Container
    {

        public Length Width { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var tag = new TagBuilder("a2-taskpad", null, IsInGrid);
            if (onRender != null)
                onRender(tag);
            tag.RenderStart(context);
            RenderChildren(context);
            tag.RenderEnd(context);
        }
    }
}

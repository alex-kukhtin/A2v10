using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml
{
    public class Taskpad : Container
    {

        public Width Width { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var tag = new TagBuilder("div", "taskpad");
            if (onRender != null)
                onRender(tag);
            tag.RenderStart(context);
            RenderChildren(context);
            tag.RenderEnd(context);
        }
    }
}

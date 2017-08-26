using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml
{
    public class Block : Container
    {
        internal override void RenderElement(RenderContext context)
        {
            var div = new TagBuilder("div");

            div.RenderStart(context);
            RenderChildren(context);
            div.RenderEnd(context);
        }
    }
}

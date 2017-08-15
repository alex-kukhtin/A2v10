using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml
{
    public class Toolbar : Container
    {
        internal override void RenderElement(RenderContext context)
        {
            var tb = new TagBuilder("div", "toolbar");
            tb.RenderStart(context);
            RenderChildren(context);
            tb.RenderEnd(context);
        }
    }
}

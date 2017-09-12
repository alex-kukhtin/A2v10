using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml
{
    public class Line : Inline
    {
        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            new TagBuilder("hr").Render(context, TagRenderMode.SelfClosing);
        }
    }
}

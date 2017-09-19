using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml
{
    public class Panel : Container, ITableControl
    {
        public Object Header { get; set; }
        public Icon Icon { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var panel = new TagBuilder("div", "panel");
            panel.RenderStart(context);
            RenderChildren(context);
            panel.RenderEnd(context);
        }
    }
}

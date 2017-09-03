using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml
{
    public class TabCollection : List<Tab>
    {
    }

    public class Tab : Container
    {
        public String Header { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var tab = new TagBuilder("a2-tab-item");
            if (onRender != null)
                onRender(tab);
            MergeAttributes(tab, context);
            tab.MergeAttribute("header", Header);
            tab.RenderStart(context);

            RenderChildren(context);

            tab.RenderEnd(context);
        }

        internal void RenderTemplate(RenderContext context)
        {
            // without outer tag
            RenderChildren(context);
        }
    }
}

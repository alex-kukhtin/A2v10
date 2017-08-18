using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Markup;

namespace A2v10.Xaml
{
    [ContentProperty("Children")]
    public class Page : RootContainer
    {

        internal override void RenderElement(RenderContext context)
        {
            var page = new TagBuilder("div", "page");
            page.MergeAttribute("id", context.RootId);
            page.RenderStart(context);
            RenderChildren(context);
            page.RenderEnd(context);
        }
    }
}

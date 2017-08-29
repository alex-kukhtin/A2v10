using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml
{
    public class Pager : UIElement
    {
        public Object Source { get; set; }
        internal override void RenderElement(RenderContext context)
        {
            //<a2-pager :source = "Parent.pager" />
            var pager = new TagBuilder("a2-pager");
            var source = GetBinding(nameof(Source));
            if (source == null)
                throw new XamlException("Pager has no Source binding");
            pager.MergeAttribute(":source", source.Path);
            pager.Render(context, TagRenderMode.SelfClosing);
        }
    }
}

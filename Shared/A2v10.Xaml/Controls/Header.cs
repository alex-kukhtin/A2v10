using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Markup;

namespace A2v10.Xaml
{
    public class Header : UiContentElement
    {
        public ControlSize Size { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            String tagName = "h3";
            switch (Size)
            {
                case ControlSize.Large: tagName = "h2"; break;
                case ControlSize.Small: tagName = "h4"; break;
                case ControlSize.Mini: tagName = "h5"; break;
            }

            var h = new TagBuilder(tagName, "a2-header", IsInGrid);
            MergeAttributes(h, context);
            h.RenderStart(context);
            RenderContent(context);
            h.RenderEnd(context);
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Markup;

namespace A2v10.Xaml
{
    public class Code : ContentControl
    {
        public Boolean Multiline { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var code = new TagBuilder(Multiline ? "pre" : "code");
            if (onRender != null)
                onRender(code);
            if (Multiline)
                code.AddCssClass("pre-scrollable");
            code.AddCssClass("a2-code");
            MergeAttributes(code, context);
            code.RenderStart(context);
            RenderContent(context);
            code.RenderEnd(context);
        }
    }
}

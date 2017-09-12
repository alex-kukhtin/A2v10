using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Markup;

namespace A2v10.Xaml
{
    [ContentProperty("Content")]
    public class Span : Inline
    {
        public Object Content { get; set; }

        public Boolean? Bold { get; set; }
        public Boolean? Italic { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var span = new TagBuilder("span");
            MergeAttributes(span, context);
            span.AddCssClassBoolNo(Bold, "bold");
            span.AddCssClassBoolNo(Italic, "italic");
            var cbind = GetBinding(nameof(Content));
            if (cbind != null)
                span.MergeAttribute("v-text", cbind.GetPathFormat(context));

            span.RenderStart(context);
            if (Content is String)
                context.Writer.Write(Content.ToString());
            span.RenderEnd(context);
        }
    }
}

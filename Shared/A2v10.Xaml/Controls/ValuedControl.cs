using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml
{
    public abstract class ValuedControl : Control
    {
       public Object Value { get; set; }

       internal void MergeValue(TagBuilder input, RenderContext context)
       {
            MergeValueItemProp(input, context, nameof(Value));
       }

        internal virtual void MergeAlign(TagBuilder input, RenderContext context, TextAlign align)
        {
            var alignProp = GetBinding("Align");
            if (alignProp != null)
                input.MergeAttribute(":align", alignProp.GetPath(context));
            else if (align != TextAlign.Default)
                input.MergeAttribute("align", align.ToString().ToLowerInvariant());
        }
    }
}

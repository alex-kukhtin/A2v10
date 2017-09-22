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
    }
}

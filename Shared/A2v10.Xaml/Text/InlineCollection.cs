using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml
{
    public sealed class InlineCollection : List<Object>
    {
        internal void Render(RenderContext context)
        {
            foreach (var x in this) {
                if (x == null)
                    continue;
                if (x is String)
                    context.Writer.Write(x.ToString());
                else if (x is Inline)
                    (x as Inline).RenderElement(context);
                else
                    throw new XamlException($"Invalid inline element '{x.GetType().ToString()}'");
            }
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml
{
    public class Group : Container
    {
        internal override void RenderElement(RenderContext context)
        {
            RenderChildren(context);
        }
    }
}

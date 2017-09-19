using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml
{
    public class Group : Container, ITableControl
    {
        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            RenderChildren(context);
        }
    }
}

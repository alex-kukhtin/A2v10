using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml
{
    public class TextBox : ValuedControl
    {
        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var input = new TagBuilder("textbox");
            MergeValue(input, context);
            input.Render(context);
        }
    }
}

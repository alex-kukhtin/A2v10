using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Markup;

namespace A2v10.Xaml
{
    [ContentProperty("Inlines")]

    public class Text : UIElementBase
    {
        public InlineCollection Inlines { get; } = new InlineCollection();

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            Inlines.Render(context);
            //throw new NotImplementedException();
        }
    }
}



using System;

namespace A2v10.Xaml
{
    public class UIElementBase : XamlElement
    {

        internal virtual Boolean SkipRender(RenderContext context)
        {
            return false;
        }

        internal virtual void RenderElement(RenderContext context)
        {

        }
    }
}

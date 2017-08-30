
using System;

namespace A2v10.Xaml
{
    public abstract class UIElementBase : XamlElement
    {

        internal virtual Boolean SkipRender(RenderContext context)
        {
            return false;
        }

        internal abstract void RenderElement(RenderContext context);
    }
}

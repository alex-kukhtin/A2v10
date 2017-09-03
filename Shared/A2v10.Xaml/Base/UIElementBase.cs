
using System;

namespace A2v10.Xaml
{
    public abstract class UIElementBase : XamlElement
    {

        internal Boolean IsInGrid { get; set; }

        internal virtual Boolean SkipRender(RenderContext context)
        {
            return false;
        }

        internal abstract void RenderElement(RenderContext context, Action<TagBuilder> onRender = null);
    }
}

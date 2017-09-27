using System;

namespace A2v10.Xaml
{
    public class Selector : ValuedControl, ITableControl
    {
        public TextAlign Align { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var input = new TagBuilder("selector", null, IsInGrid);
            if (onRender != null)
                onRender(input);
            MergeAttributes(input, context);
            MergeAlign(input, context, Align);
            MergeValue(input, context);
            input.RenderStart(context);
            RenderAddOns(context);
            input.RenderEnd(context);
        }
    }
}

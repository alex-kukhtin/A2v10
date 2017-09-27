using System;

namespace A2v10.Xaml
{
    public class Static : ValuedControl, ITableControl
    {
        public TextAlign Align { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var input = new TagBuilder("static", null, IsInGrid);
            if (onRender != null)
                onRender(input);
            MergeAttributes(input, context);
            MergeValue(input, context); // item, prop for validator
            MergeAlign(input, context, Align);
            var valBind = GetBinding(nameof(Value));
            if (valBind != null)
                input.MergeAttribute(":text", valBind.GetPathFormat(context)); // formatted
            input.RenderStart(context);
            RenderAddOns(context);
            input.RenderEnd(context);
        }
    }
}

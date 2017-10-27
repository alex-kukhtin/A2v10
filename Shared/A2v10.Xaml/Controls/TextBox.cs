using System;

namespace A2v10.Xaml
{
    public class TextBox : ValuedControl, ITableControl
    {
        public String Placeholder { get; set; }

        public TextAlign Align { get; set; }

        public Boolean Multiline { get; set; }

        public Int32? Rows { get; set; }

        public Boolean Password { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var input = new TagBuilder(Multiline ? "a2-textarea" : "textbox", null, IsInGrid);
            if (onRender != null)
                onRender(input);
            MergeAttributes(input, context);
            MergeDisabled(input, context);
            if (Multiline)
                MergeAttributeInt32(input, context, "rows", nameof(Rows), Rows);
            if (Password)
                input.MergeAttribute(":password", "true");
            MergeAlign(input, context, Align);
            MergeBindingAttributeString(input, context, "placeholder", nameof(Placeholder), Placeholder);
            MergeValue(input, context);
            input.RenderStart(context);
            RenderAddOns(context);
            input.RenderEnd(context);
        }
    }
}

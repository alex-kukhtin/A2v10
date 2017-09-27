using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml
{
    public class DatePicker : ValuedControl
    {

        public TextAlign Align { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var input = new TagBuilder("a2-date-picker", null, IsInGrid);
            if (onRender != null)
                onRender(input);
            MergeAttributes(input, context);
            MergeAlign(input, context, Align);
            MergeValue(input, context);
            input.RenderStart(context);
            RenderAddOns(context);
            input.RenderEnd(context);
        }

        protected override void OnEndInit()
        {
            base.OnEndInit();
            if (Align == TextAlign.Default)
                Align = TextAlign.Center;
        }
    }
}

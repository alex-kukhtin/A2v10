// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.


using System;

namespace A2v10.Xaml
{
    public class DatePicker : ValuedControl
    {

        public TextAlign Align { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
           CheckDisabledModel(context);
            var input = new TagBuilder("a2-date-picker", null, IsInGrid);
            if (onRender != null)
                onRender(input);
            MergeAttributes(input, context);
            MergeDisabled(input, context);
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

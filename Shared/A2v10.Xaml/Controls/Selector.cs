// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
    public class Selector : ValuedControl, ITableControl
    {
        public TextAlign Align { get; set; }

        public String Delegate { get; set; }

        public String DisplayProperty { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var input = new TagBuilder("a2-selector", null, IsInGrid);
            if (onRender != null)
                onRender(input);
            if (!String.IsNullOrEmpty(Delegate))
                input.MergeAttribute(":fetch", $"$delegate('{Delegate}')");
            input.MergeAttribute("display", DisplayProperty);
            MergeAttributes(input, context);
            MergeAlign(input, context, Align);
            MergeValue(input, context);
            input.RenderStart(context);
            RenderAddOns(context);
            input.RenderEnd(context);
        }
    }
}

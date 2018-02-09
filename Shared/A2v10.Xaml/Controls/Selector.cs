// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
    public class Selector : ValuedControl, ITableControl
    {
        public TextAlign Align { get; set; }

        public String Delegate { get; set; }

        public String DisplayProperty { get; set; }

        public Size ListSize { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            CheckDisabledModel(context);
            var input = new TagBuilder("a2-selector", null, IsInGrid);
            if (onRender != null)
                onRender(input);
            if (!String.IsNullOrEmpty(Delegate))
                input.MergeAttribute(":fetch", $"$delegate('{Delegate}')");
            input.MergeAttribute("display", DisplayProperty);
            if (ListSize != null)
            {
                if (!ListSize.Width.IsEmpty)
                    input.MergeAttribute("list-width", ListSize.Width.ToString());
                if (!ListSize.Height.IsEmpty)
                    input.MergeAttribute("list-height", ListSize.Height.ToString());
            }
            MergeAttributes(input, context);
            MergeDisabled(input, context);
            MergeAlign(input, context, Align);
            MergeValue(input, context);
            input.RenderStart(context);
            RenderAddOns(context);
            input.RenderEnd(context);
        }
    }
}

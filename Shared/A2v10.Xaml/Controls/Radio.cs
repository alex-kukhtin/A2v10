// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
    public class Radio : CheckBoxBase
    {
        internal override string ControlType => "radio";

        public Object CheckedValue { get; set; }

        internal override void MergeCheckBoxAttributes(TagBuilder tag, RenderContext context)
        {
            base.MergeCheckBoxAttributes(tag, context);
            if (CheckedValue == null)
                throw new XamlException("The CheckedValue attribute is required for Radio");
            tag.MergeAttribute("value", CheckedValue.ToString());
        }
    }
}

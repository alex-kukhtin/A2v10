// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
    public class Radio : CheckBoxBase
    {
        internal override string ControlType => "radio";

        internal override void MergeCheckBoxAttributes(TagBuilder tag, RenderContext context)
        {
            base.MergeCheckBoxAttributes(tag, context);
            // TODO Merge Checked Value 
            throw new NotImplementedException();
        }
    }
}

// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.


using System;

namespace A2v10.Xaml
{
    public abstract class Inline : UIElementBase
    {
        public Boolean Block { get; set; }
        public Boolean? Bold { get; set; }
        public Boolean? Italic { get; set; }

        internal override void MergeAttributes(TagBuilder tag, RenderContext context, MergeAttrMode mode = MergeAttrMode.All)
        {
            base.MergeAttributes(tag, context, mode);
            tag.AddCssClassBoolNo(Bold, "bold");
            tag.AddCssClassBoolNo(Italic, "italic");
            tag.AddCssClassBool(Block, "block");
        }
    }
}

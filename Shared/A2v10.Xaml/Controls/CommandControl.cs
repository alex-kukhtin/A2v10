// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.


namespace A2v10.Xaml
{
	public abstract class CommandControl : ContentControl
	{
        public Command Command { get; set; }

        internal override void MergeAttributes(TagBuilder tag, RenderContext context, MergeAttrMode mode = MergeAttrMode.All)
        {
            base.MergeAttributes(tag, context, mode);
            MergeCommandAttribute(tag, context);
        }

        internal void MergeAttributesBase(TagBuilder tag, RenderContext context, MergeAttrMode mode = MergeAttrMode.All)
        {
            // without commands
            base.MergeAttributes(tag, context, mode);
        }
    }
}

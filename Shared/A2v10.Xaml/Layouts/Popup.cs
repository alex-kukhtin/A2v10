// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
    public class Popup : RootContainer
    {
        public Length Width { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var tag = new TagBuilder("div", "a2-popup");
            tag.MergeAttribute("id", context.RootId);
            MergeAttributes(tag, context, MergeAttrMode.Margin);
            if (Width != null)
                tag.MergeStyle("width", Width.ToString());
            tag.RenderStart(context);
            RenderChildren(context);
            tag.RenderEnd(context);
        }
    }
}

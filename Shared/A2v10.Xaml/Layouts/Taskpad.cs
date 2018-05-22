// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
    public class Taskpad : Container
    {

        public Length Width { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var tag = new TagBuilder("a2-taskpad", null, IsInGrid);
			onRender?.Invoke(tag);
			MergeAttributes(tag, context);
            tag.RenderStart(context);
            RenderChildren(context);
            tag.RenderEnd(context);
        }
    }
}

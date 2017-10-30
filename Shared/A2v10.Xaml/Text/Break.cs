// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
    public class Break : Inline
    {
        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            new TagBuilder("br").Render(context, TagRenderMode.SelfClosing);
        }
    }
}

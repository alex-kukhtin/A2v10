// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
    public class MenuItem: CommandControl
    {
        public Icon Icon { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var mi = new TagBuilder("a", "dropdown-item");
            MergeAttributes(mi, context);

            mi.RenderStart(context);
            RenderIcon(context, Icon);
            RenderContent(context);
            mi.RenderEnd(context);
        }
    }
}

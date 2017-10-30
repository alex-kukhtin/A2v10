// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
    public class StackPanel : Container, ITableControl
    {
        public Orientation Orientation { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var div = new TagBuilder("div", "stack-panel", IsInGrid);
            if (onRender != null)
                onRender(div);
            MergeAttributes(div, context);
            div.AddCssClass(Orientation.ToString().ToLowerInvariant());
            div.RenderStart(context);
            RenderChildren(context);
            div.RenderEnd(context);
        }
    }
}

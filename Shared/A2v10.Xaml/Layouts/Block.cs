// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;

namespace A2v10.Xaml
{
    [ContentProperty("Children")]
    public class Block : UIElementBase, ITableControl
    {

        public UIElementCollection Children { get; set; } = new UIElementCollection();

        internal virtual void RenderChildren(RenderContext context)
        {
            foreach (var c in Children)
            {
                c.RenderElement(context);
            }
        }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var div = new TagBuilder("div", null, IsInGrid);
            if (onRender != null)
                onRender(div);
            MergeAttributes(div, context, MergeAttrMode.Margin | MergeAttrMode.Visibility);
            div.RenderStart(context);
            RenderChildren(context);
            div.RenderEnd(context);
        }

        protected override void OnEndInit()
        {
            base.OnEndInit();
            foreach (var c in Children)
                c.SetParent(this);
        }

    }
}

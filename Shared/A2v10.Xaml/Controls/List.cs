// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;

namespace A2v10.Xaml
{
    [ContentProperty("ItemTemplate")]
    public class List : Control
    {
        public Object ItemsSource { get; set; }

        public UIElement ItemTemplate { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var ul = new TagBuilder("ul", "a2-list", IsInGrid);
            if (onRender != null)
                onRender(ul);
            ul.RenderStart(context);
            RenderItems(context);
            ul.RenderEnd(context);
        }

        void RenderItems(RenderContext context)
        {
            if (ItemTemplate == null)
                return;
            var li = new TagBuilder("li");
            var isBind = GetBinding(nameof(ItemsSource));
            if (isBind == null)
                return;
            li.MergeAttribute("v.for", $"(item, itemIndex) in {isBind.GetPath(context)}");
            li.MergeAttribute(":key", "itemIndex");
            using (new ScopeContext(context, "item"))
            {
                ItemTemplate.RenderElement(context);
            }
        }
    }
}

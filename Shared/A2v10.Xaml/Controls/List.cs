// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;
using A2v10.Infrastructure;

namespace A2v10.Xaml
{
    [ContentProperty("ItemTemplate")]
    public class List : Control, ITableControl
    {
        public Object ItemsSource { get; set; }

        public UIElementBase ItemTemplate { get; set; }

        public AutoSelectMode AutoSelect { get; set; }

        public Length Height { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var ul = new TagBuilder("a2-list", null, IsInGrid);
            if (onRender != null)
                onRender(ul);
            var isBind = GetBinding(nameof(ItemsSource));
            if (isBind != null)
            {
                ul.MergeAttribute(":items-source", isBind.GetPath(context));
                ul.MergeAttribute("v-lazy", isBind.GetPath(context));
            }
            MergeAttributes(ul, context);
            if (Height != null)
                ul.MergeStyle("height", Height.Value);
            if (AutoSelect != AutoSelectMode.None)
                ul.MergeAttribute("auto-select", AutoSelect.ToString().ToKebabCase());
            ul.RenderStart(context);
            RenderBody(context);
            ul.RenderEnd(context);
        }

        void RenderBody(RenderContext context)
        {
            if (ItemTemplate == null)
                return;
            var tml = new TagBuilder("template");
            tml.MergeAttribute("slot", "items");
            tml.MergeAttribute("slot-scope", "listItem");
            tml.RenderStart(context);
            using (new ScopeContext(context, "listItem.item"))
            {
                ItemTemplate.RenderElement(context);
            }
            tml.RenderEnd(context);
        }
    }
}

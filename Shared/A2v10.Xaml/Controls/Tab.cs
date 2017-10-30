// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;

namespace A2v10.Xaml
{
    public class TabCollection : List<Tab>
    {
    }

    /*
     * TODO:
     * 1. Можно добавить раскраску. атрибут tab-style="yellow", а в Tab.less есть такой класс
     */

    public class Tab : Container
    {
        public Object Header { get; set; }

        public String Badge { get; set; }

        public Length Height { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var tab = new TagBuilder("a2-tab-item");
            if (onRender != null)
                onRender(tab);
            MergeAttributes(tab, context);
            var headerBind = GetBinding(nameof(Header));
            if (headerBind != null)
                tab.MergeAttribute(":header", headerBind.GetPathFormat(context));
            else if (Header is String)
                tab.MergeAttribute("header", Header?.ToString());
            var badgeBind = GetBinding(nameof(Badge));
            if (badgeBind != null)
                tab.MergeAttribute(":badge", badgeBind.GetPathFormat(context));
            else if (Badge != null)
                tab.MergeAttribute("badge", Badge);
            if (Height != null)
                tab.MergeStyle("height", Height.Value);
            tab.RenderStart(context);

            RenderChildren(context);

            tab.RenderEnd(context);
        }

        internal void RenderTemplate(RenderContext context)
        {
            // without outer tag
            RenderChildren(context);
        }
    }
}

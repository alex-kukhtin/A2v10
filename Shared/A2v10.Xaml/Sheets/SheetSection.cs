// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Windows.Markup;

namespace A2v10.Xaml
{
    [ContentProperty("Children")]
    public class SheetSection : SheetElement
    {
        public Object ItemsSource { get; set; }

        public List<SheetElement> Children { get; } = new List<SheetElement>();

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var tbody = new TagBuilder("tbody");
            MergeAttributes(tbody, context);
            tbody.RenderStart(context);
            var isBind = GetBinding(nameof(ItemsSource));
            if (isBind != null)
            {
                var tml = new TagBuilder("template");
                tml.MergeAttribute("v-if", "true");
                tml.MergeAttribute("v-for", $"(item, itemIndex) of {isBind.GetPath(context)}");
                tml.RenderStart(context);
                using (var scope = new ScopeContext(context, "item"))
                {
                    foreach (var r in Children)
                        r.RenderElement(context);
                }
                tml.RenderEnd(context);
            }
            else
            {
                foreach (var r in Children)
                    r.RenderElement(context);
            }
            tbody.RenderEnd(context);
        }

        protected override void OnEndInit()
        {
            base.OnEndInit();
            foreach (var r in Children)
                r.SetParent(this);
        }
    }
}

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
            foreach (var r in Children)
                r.RenderElement(context);
            tbody.RenderEnd(context);
            throw new NotImplementedException();
        }

        protected override void OnEndInit()
        {
            base.OnEndInit();
            foreach (var r in Children)
                r.SetParent(this);
        }
    }
}

// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Windows.Markup;

namespace A2v10.Xaml
{
    [ContentProperty("Cells")]
    public class SheetRow : UIElement
    {
        public SheetCells Cells { get; } = new SheetCells();

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var tr = new TagBuilder("tr");
            MergeAttributes(tr, context);
            tr.RenderStart(context);
            foreach (var c in Cells)
                c.RenderElement(context);
            tr.RenderEnd(context);
        }

        protected override void OnEndInit()
        {
            base.OnEndInit();
            foreach (var c in Cells)
                c.SetParent(this);
        }
    }

    public class SheetRows : List<SheetRow>
    {

    }
}

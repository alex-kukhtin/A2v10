// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Windows.Markup;
using A2v10.Infrastructure;

namespace A2v10.Xaml
{
    public enum RowStyle
    {
        Default,
        Title,
        Header,
        Footer,
        Total
    }

    [ContentProperty("Cells")]
    public class SheetRow : UIElement
    {
        public SheetCells Cells { get; } = new SheetCells();

        public RowStyle Style { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var tr = new TagBuilder("tr");
            if (onRender != null)
                onRender(tr);
            MergeAttributes(tr, context);
            if (Style != RowStyle.Default)
                tr.AddCssClass("row-" + Style.ToString().ToKebabCase());
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

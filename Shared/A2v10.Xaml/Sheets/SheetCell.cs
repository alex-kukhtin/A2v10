// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;

namespace A2v10.Xaml
{
    public class SheetCell : UiContentElement
    {
        public Int32? ColSpan { get; set; }
        public Int32? RowSpan { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var td = new TagBuilder("td");
            MergeAttributes(td, context);
            td.MergeAttribute("colspan", ColSpan);
            td.MergeAttribute("rowspan", RowSpan);
            MergeContent(td, context);
            td.RenderStart(context);
            RenderContent(context);
            td.RenderEnd(context);
        }
    }

    public class SheetCells : List<SheetCell>
    {

    }
}

// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using A2v10.Infrastructure;

namespace A2v10.Xaml
{

    public class TableMarkCell : UiContentElement
    {
        public MarkStyle Mark { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var td = new TagBuilder("td", "marker-cell");
			onRender?.Invoke(td);
			td.RenderStart(context);
            var div = new TagBuilder("div", "marker");
            var markBind = GetBinding(nameof(Mark));
            if (markBind != null)
            {
                div.MergeAttribute(":class", markBind.GetPathFormat(context));
            }
            else if (Mark != MarkStyle.Default)
                div.AddCssClass(Mark.ToString().ToKebabCase());
            div.Render(context);
            td.RenderEnd(context);
        }
    }
}

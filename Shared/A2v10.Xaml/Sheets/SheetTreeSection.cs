// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
    public class SheetTreeSection : SheetSection
    {
        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var section = new TagBuilder("a2-sheet-section-tree");
            var isBind = GetBinding(nameof(ItemsSource));
            if (isBind != null)
            {
                String path = isBind.GetPath(context);
                var pp = SplitToPathProp(path);
                section.MergeAttribute(":items-source", pp.Path);
                section.MergeAttribute("prop-name", pp.Prop);
            }
            section.RenderStart(context);
            var tml = new TagBuilder("template");
            tml.MergeAttribute("slot-scope", "row");
            tml.RenderStart(context);
            using (var scope = new ScopeContext(context, "row.item"))
            {
                foreach (var r in Children)
                    r.RenderElement(context, (tr) => tr.MergeAttribute(":class", "row.rowCssClass()"));
            }
            tml.RenderEnd(context);
            section.RenderEnd(context);
        }
    }
}

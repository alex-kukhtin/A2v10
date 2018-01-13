// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.


using System;
using System.Windows.Markup;

namespace A2v10.Xaml
{
    [ContentProperty("Children")]
    public class PropertyGrid : UIElement, ITableControl
    {

        /* TODO: 
         * 3. Grouping
         */
        public Object ItemsSource { get; set; }
        public Boolean Compact { get; set; }
        public Boolean Striped { get; set; }

        public PropertyGridItems Children { get; set; } = new PropertyGridItems();
        public GridLinesVisibility GridLines { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var table = new TagBuilder("table", "prop-grid", IsInGrid);
            if (onRender != null)
                onRender(table);
            table.AddCssClassBool(Compact, "compact");
            table.AddCssClassBool(Striped, "striped");
            MergeAttributes(table, context);
            if (GridLines != GridLinesVisibility.None)
                table.AddCssClass($"grid-{GridLines.ToString().ToLowerInvariant()}");

            table.RenderStart(context);
            RenderColumns(context);
            RenderBody(context);
            table.RenderEnd(context);
        }

        void RenderColumns(RenderContext context)
        {
            var colGroup = new TagBuilder("colgroup").RenderStart(context);
            new TagBuilder("col", "prop-name").Render(context, TagRenderMode.SelfClosing);
            new TagBuilder("col", "prop-value").Render(context, TagRenderMode.SelfClosing);
            colGroup.RenderEnd(context);
        }

        void RenderBody(RenderContext context)
        {
            var tbody = new TagBuilder("tbody").RenderStart(context);
            var isBind = GetBinding(nameof(ItemsSource));
            if (isBind != null)
            {
                if (Children.Count != 1)
                    throw new XamlException("For a table with an items source, only one child element is allowed");
                String path = isBind.GetPath(context); // before scope!
                using (new ScopeContext(context, "prop"))
                {
                    Children[0].RenderElement(context, (tag) => {
                        tag.MergeAttribute("v-for", $"(prop, propIndex) in {path}");
                        tag.MergeAttribute(":key", "propIndex");
                    });
                }
            }
            else
            {
                Children.Render(context);
            }
            tbody.RenderEnd(context);
        }
    }
}

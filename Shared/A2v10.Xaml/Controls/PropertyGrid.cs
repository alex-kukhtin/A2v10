
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

        public PropertyGridItems Children { get; set; } = new PropertyGridItems();
        public GridLinesVisibility GridLines { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var table = new TagBuilder("table", "prop-grid", IsInGrid);
            if (onRender != null)
                onRender(table);
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
                var tr = new TagBuilder("tr");
                tr.MergeAttribute("v-for", $"(prop, propIndex) in {isBind.GetPath(context)}");
                tr.MergeAttribute(":key", "propIndex");
                tr.RenderStart(context);
                using (new ScopeContext(context, "prop"))
                {
                    Children[0].RenderElement(context, (tag) => tag.MergeAttribute(":key", "propIndex"));
                }
                tr.RenderEnd(context);
            }
            else
            {
                Children.Render(context);
            }
            tbody.RenderEnd(context);
        }
    }
}

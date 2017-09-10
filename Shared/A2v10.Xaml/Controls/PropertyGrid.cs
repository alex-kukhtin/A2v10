
using System;
using System.Windows.Markup;

namespace A2v10.Xaml
{
    [ContentProperty("Children")]
    public class PropertyGrid : UIElement, ITableControl
    {

        /* TODO: 
         * 1. PropertyGridItem
         * 2. Render
         * 3. Grouping
         */
        public Object ItemsSource { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var table = new TagBuilder("table", "prop-grid");
            if (onRender != null)
                onRender(table);
            MergeAttributes(table, context);
            table.RenderStart(context);
            RenderColumns(context);
            RenderBody(context);
            table.RenderEnd(context);
        }

        void RenderColumns(RenderContext context)
        {
            var colGroup = new TagBuilder("colgroup").RenderStart(context);
            new TagBuilder("col", "prop-name").Render(context);
            new TagBuilder("col", "prop-value").Render(context);
            colGroup.RenderEnd(context);
        }

        void RenderBody(RenderContext context)
        {
            var tbody = new TagBuilder("tbody").RenderStart(context);
            var isBind = GetBinding(nameof(ItemsSource));
            if (isBind != null)
            {
                var tr = new TagBuilder("tr");
                tr.MergeAttribute("v-for", $"(prop, propIndex) in {isBind.GetPath(context)}");
                tr.MergeAttribute(":key", "propIndex");
                tr.RenderStart(context);
                tr.RenderEnd(context);
            }
            tbody.RenderEnd(context);
        }
    }
}

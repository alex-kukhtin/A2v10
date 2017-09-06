using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Markup;

namespace A2v10.Xaml
{

    public class TableCellCollection : UIElementCollection
    {

    }

    public class TableCell : ContentControl
    {

        public Int32? ColSpan { get; set; }
        public Int32? RowSpan { get; set; }

        public Object ItemsSource { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var td = new TagBuilder("td");
            if (onRender != null)
                onRender(td);

            MergeAttributes(td, context);

            if (Content is ITableControl)
                td.AddCssClass("ctrl");

            Bind isBind = GetBinding(nameof(ItemsSource));
            if (isBind != null)
            {
                td.MergeAttribute("v-for", $"(cell, cellIndex) in {isBind.GetPath(context)}");
                td.MergeAttribute(":key", "cellIndex");
            }
            MergeAttributeInt32(td, context, nameof(ColSpan), "colspan", ColSpan);
            MergeAttributeInt32(td, context, nameof(RowSpan), "rowspan", RowSpan);
            td.RenderStart(context);
            RenderContent(context);
            td.RenderEnd(context);
        }
    }
}

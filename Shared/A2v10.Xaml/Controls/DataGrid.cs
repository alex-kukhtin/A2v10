using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Markup;

namespace A2v10.Xaml
{
    [ContentProperty("Columns")]
    public class DataGrid : Control
    {
        public Boolean Hover { get; set; }
        public Boolean Striped { get; set; }
        public Boolean Bordered { get; set; }

        public Object ItemsSource { get; set; }

        public List<DataGridColumn> Columns { get; set; } = new List<DataGridColumn>();

        internal override void RenderElement(RenderContext context)
        {
            var dataGrid = new TagBuilder("data-grid");
            var isb = GetBinding(nameof(ItemsSource));
            if (isb != null)
                dataGrid.MergeAttribute(":items-source", isb.Path);
            //TODO: обобщить для булевских атрибутов (в UI Element)
            if (Hover)
                dataGrid.MergeAttribute(":hover", "true");
            if (Striped)
                dataGrid.MergeAttribute(":striped", "true");
            if (Bordered)
                dataGrid.MergeAttribute(":bordered", "true");
            dataGrid.RenderStart(context);
            foreach (var col in Columns)
                col.RenderColumn(context);
            dataGrid.RenderEnd(context);
        }

        protected override void OnEndInit()
        {
            base.OnEndInit();
            foreach (var col in Columns)
                col.SetParent(this);
        }
    }
}

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
        public Boolean Border { get; set; }
        public Boolean Sort { get; set; }

        public Object ItemsSource { get; set; }

        public DataGridColumnCollection Columns { get; set; } = new DataGridColumnCollection();

        internal override void RenderElement(RenderContext context)
        {
            var dataGrid = new TagBuilder("data-grid");
            var isb = GetBinding(nameof(ItemsSource));
            if (isb != null)
                dataGrid.MergeAttribute(":items-source", isb.Path);
            MergeBoolAttribute(dataGrid, nameof(Hover), Hover);
            MergeBoolAttribute(dataGrid, nameof(Striped), Striped);
            MergeBoolAttribute(dataGrid, nameof(Border), Border);
            //MergeBoolAttribute(dataGrid, nameof(Sort), Sort);
            // TODO: ????
            dataGrid.MergeAttribute("sort", "server");
            dataGrid.MergeAttribute(":route-query", "$query"); // always!
            dataGrid.RenderStart(context);
            Int32 colIndex = 0;
            foreach (var col in Columns)
            {
                //using (context.NewScope($"col{++colIndex}"))
                //{
                    col.RenderColumn(context);
                //}
            }
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

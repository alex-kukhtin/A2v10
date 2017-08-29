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

        public GridLinesVisibility GridLines { get; set; }

        public Object ItemsSource { get; set; }

        public Pager Pager { get; set; }
        public UIElementBase Toolbar { get; set; }

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

            // TODO: binding for GridLines ???
            if (GridLines != GridLinesVisibility.None)
                dataGrid.MergeAttribute("grid", GridLines.ToString());

            dataGrid.RenderStart(context);
            Int32 colIndex = 0;
            foreach (var col in Columns)
            {
                col.RenderColumn(context, colIndex);
                colIndex++;
            }

            if (Toolbar != null)
            {
                var tbTml = new TagBuilder("template");
                tbTml.MergeAttribute("slot", "toolbar");
                tbTml.MergeAttribute("scope", "props");
                tbTml.RenderStart(context);
                Toolbar.RenderElement(context);
                tbTml.RenderEnd(context);

            }
            if (Pager != null)
            {
                var pagerTml = new TagBuilder("template");
                pagerTml.MergeAttribute("slot", "pager");
                pagerTml.MergeAttribute("scope", "props");
                pagerTml.RenderStart(context);
                Pager.RenderElement(context);
                pagerTml.RenderEnd(context);

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

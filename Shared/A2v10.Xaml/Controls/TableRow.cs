using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Markup;

namespace A2v10.Xaml
{

    public class TableRowCollection : List<TableRow>
    {
        internal void Render(RenderContext context)
        {
            foreach (var r in this)
                r.RenderElement(context);
        }
    }

    [ContentProperty("Cells")]
    public class TableRow : UIElement
    {
        public TableCellCollection Cells { get; set; } = new TableCellCollection();

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var row = new TagBuilder("tr");
            if (onRender != null)
                onRender(row);
            MergeAttributes(row, context);
            row.RenderStart(context);
            RenderCells(context);
            row.RenderEnd(context);
        }

        void RenderCells(RenderContext context)
        {
            foreach (var c in Cells)
                c.RenderElement(context);
        }

        protected override void OnEndInit()
        {
            base.OnEndInit();
            TableCellCollection newCells = new TableCellCollection();
            foreach (var c in Cells) {
                if (c is TableCell)
                    newCells.Add(c);
                else
                    newCells.Add(new TableCell() { Content = c });
            }
            Cells = newCells;
            foreach (var c in Cells)
                c.SetParent(this);
        }
    }
}

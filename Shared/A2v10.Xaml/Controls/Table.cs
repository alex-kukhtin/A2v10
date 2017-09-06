using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Markup;

namespace A2v10.Xaml
{
    [ContentProperty("Rows")]
    public class Table : Control, ITableControl
    {
        public GridLinesVisibility GridLines { get; set; }

        public TableRowCollection Rows { get; set; } = new TableRowCollection();

        public TableRowCollection Header
        {
            get
            {
                if (_header == null)
                    _header = new TableRowCollection();
                return _header;
            }
            set
            {
                _header = value;
            }
        }

        public TableRowCollection Footer
        {
            get
            {
                if (_footer == null)
                    _footer = new TableRowCollection();
                return _footer;
            }
            set { _footer = value; }
        }


        TableRowCollection _header;
        TableRowCollection _footer;

        public Object ItemsSource { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var table = new TagBuilder("table", "a2-table", IsInGrid);
            if (onRender != null)
                onRender(table);
            MergeAttributes(table, context);

            if (GridLines != GridLinesVisibility.None)
                table.AddCssClass($"grid-{GridLines.ToString().ToLowerInvariant()}");

            table.RenderStart(context);
            RenderHeader(context);

            RenderBody(context);
            RenderFooter(context);

            table.RenderEnd(context);
        }

        void RenderHeader(RenderContext context)
        {
            if (_header == null)
                return;
            var thead = new TagBuilder("thead").RenderStart(context);
            foreach (var h in Header)
                h.RenderElement(context);
            thead.RenderEnd(context);
        }
        
        void RenderBody(RenderContext context)
        {
            if (Rows.Count == 0)
                return;
            var tbody = new TagBuilder("tbody").RenderStart(context);
            Bind isBind = GetBinding(nameof(ItemsSource));
            if (isBind != null)
            {
                var repeatAttr = $"(row, rowIndex) in {isBind.GetPath(context)}";
                if (Rows.Count == 1)
                {
                    Rows[0].RenderElement(context, (tag) => {
                        tag.MergeAttribute("v-for", repeatAttr);
                    } );
                }
                else
                {
                    var tml = new TagBuilder("template");
                    tml.MergeAttribute("v-for", repeatAttr);
                    tml.RenderStart(context);
                    using (var cts = new ScopeContext(context, "row"))
                    {
                        foreach (var row in Rows)
                            row.RenderElement(context, (tag) => tag.MergeAttribute(":key", "rowIndex"));
                    }
                    tml.RenderEnd(context);
                }
            }
            else
            {
                foreach (var row in Rows)
                    row.RenderElement(context);
            }
            tbody.RenderEnd(context);
        }
        
        void RenderFooter(RenderContext context)
        {
            if (_footer == null)
                return;
            var tfoot = new TagBuilder("tfoot").RenderStart(context);
            foreach (var f in Footer)
                f.RenderElement(context);
            tfoot.RenderEnd(context);
        }

        protected override void OnEndInit()
        {
            base.OnEndInit();
            foreach (var c in Rows)
                c.SetParent(this);
            if (_header != null)
                foreach (var h in Header)
                    h.SetParent(this);
            if (_footer != null)
                foreach (var f in Footer)
                    f.SetParent(this);
        }
    }
}

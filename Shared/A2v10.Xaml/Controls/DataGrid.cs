using A2v10.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Markup;

namespace A2v10.Xaml
{
    public enum RowMarkerStyle
    {
        None,
        Row,
        Marker,
        Both
    }

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

        public DataGridColumnCollection Columns { get; set; } = new DataGridColumnCollection();

        public RowMarkerStyle MarkerStyle { get; set; }

        public Object Mark { get; set; }

        public Command DoubleClick { get; set; }

        GroupDescriptions _groupBy;
        public GroupDescriptions GroupBy
        {
            get
            {
                if (_groupBy == null)
                    _groupBy = new GroupDescriptions();
                return _groupBy;
            }
            set { _groupBy = value; }
        }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var dataGrid = new TagBuilder("data-grid", null, IsInGrid);
            if (onRender != null)
                onRender(dataGrid);
            var isb = GetBinding(nameof(ItemsSource));
            if (isb != null)
                dataGrid.MergeAttribute(":items-source", isb.GetPath(context));
            MergeBoolAttribute(dataGrid, context, nameof(Hover), Hover);
            MergeBoolAttribute(dataGrid, context, nameof(Striped), Striped);
            MergeBoolAttribute(dataGrid, context, nameof(Border), Border);
            MergeBoolAttribute(dataGrid, context, nameof(Sort), Sort);
            dataGrid.MergeAttribute(":route-query", "$query"); // always!

            var dblClickBind = GetBindingCommand(nameof(DoubleClick));
            if (dblClickBind != null)
            {
                // Function!
                dataGrid.MergeAttribute(":doubleclick", "() => " + dblClickBind.GetCommand(context));
            }

            if (MarkerStyle != RowMarkerStyle.None)
                dataGrid.MergeAttribute("mark-style", MarkerStyle.ToString().ToKebabCase());

            var mbind = GetBinding(nameof(Mark));
            if (mbind != null)
            {
                dataGrid.MergeAttribute("mark", mbind.GetPath(context));
            }
            else if (Mark != null)
            {
                throw new XamlException("The Mark property must be a binding");
            }

            // TODO: binding for GridLines ???
            if (GridLines != GridLinesVisibility.None)
                dataGrid.MergeAttribute("grid", GridLines.ToString());

            var groupByBind = GetBinding(nameof(GroupBy));
            if (groupByBind != null)
            {
                dataGrid.MergeAttribute(":group-by", groupByBind.GetPath(context));
            }
            else if (_groupBy != null)
            {
                dataGrid.MergeAttribute(":group-by", _groupBy.GetJsValue());
            }

            dataGrid.RenderStart(context);
            Int32 colIndex = 0;
            foreach (var col in Columns)
            {
                col.RenderColumn(context, colIndex);
                colIndex++;
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

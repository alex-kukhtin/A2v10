// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;
using A2v10.Infrastructure;

namespace A2v10.Xaml
{
    public enum RowMarkerStyle
    {
        None,
        Row,
        Marker,
        Both
    }

    public enum HeadersVisibility
    {
        Column,
        None
    }

    [ContentProperty("Columns")]
    public class DataGrid : Control
    {
        public Boolean Hover { get; set; }
        public Boolean Striped { get; set; }
        public Boolean Border { get; set; }
        public Boolean Sort { get; set; }

        public Boolean FixedHeader { get; set; }
        public HeadersVisibility HeadersVisibility { get; set; }

        public GridLinesVisibility GridLines { get; set; }

        public Object ItemsSource { get; set; }

        public DataGridColumnCollection Columns { get; set; } = new DataGridColumnCollection();

        public RowMarkerStyle MarkerStyle { get; set; }

        public Object Mark { get; set; }

        public Command DoubleClick { get; set; }

        public Length Height { get; set; }

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
            MergeAttributes(dataGrid, context, MergeAttrMode.Margin | MergeAttrMode.Visibility);
            if (Height != null)
                dataGrid.MergeStyle("height", Height.Value);
            if (FixedHeader)
                dataGrid.MergeAttribute(":fixed-header", "true");
            if (HeadersVisibility == HeadersVisibility.None)
                dataGrid.MergeAttribute(":hide-header", "true");
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

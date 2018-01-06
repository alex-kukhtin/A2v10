// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Globalization;
using System.Windows.Markup;

namespace A2v10.Xaml
{

    [TypeConverter(typeof(TableRowCollectionConverter))]
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

    public class TableRowDivider : TableRow
    {
        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var table = (this.Parent as Table);
            var cols = Math.Max(table.Columns.Count, 1);
            var tr = new TagBuilder("tr").RenderStart(context);
            new TagBuilder("td", "row-divider").MergeAttribute("colspan", cols).Render(context);
            tr.RenderEnd(context);
        }
    }

    public class TableRowCollectionConverter : TypeConverter
    {
        public override bool CanConvertFrom(ITypeDescriptorContext context, Type sourceType)
        {
            if (sourceType == typeof(String))
                return true;
            return false;
        }

        public override Object ConvertFrom(ITypeDescriptorContext context, CultureInfo culture, Object value)
        {
            if (value == null)
                return null;
            if (value is String)
            {
                TableRowCollection trc = new TableRowCollection();
                TableRow row = new TableRow();
                trc.Add(row);
                foreach (var s in value.ToString().Split(','))
                {
                    row.Cells.Add(new TableCell() { Content = s.Trim() });
                }
                return trc;
            }
            throw new XamlException($"Invalid TableRowCollection value '{value}'");
        }
    }
}

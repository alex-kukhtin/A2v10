// Copyright © 2019 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;

namespace A2v10.Interop.ExportTo
{
	public class ExSheet
	{
		readonly IList<ExRow> _body = new List<ExRow>();
		readonly IList<ExRow> _header = new List<ExRow>();
		readonly IList<ExRow> _footer = new List<ExRow>();
		readonly IList<ExColumn> _cols = new List<ExColumn>();

		public StylesDictionary Styles { get; } = new StylesDictionary();

		public ExRow GetRow(Int32 rowNo, RowKind kind)
		{
			IList<ExRow> _rows = null;
			switch (kind) {
				case RowKind.thead:
					_rows = _header; break;
				case RowKind.tfoot:
					_rows = _footer; break;
				case RowKind.tbody:
					_rows = _body; break;
			}
			while (_rows.Count <= rowNo)
				_rows.Add(new ExRow() { Kind = kind});
			return _rows[rowNo];
		}

		ExCell AddSpanCell(RowKind kind, Int32 row, Int32 col)
		{
			var r = GetRow(row, kind);
			return r.SetSpanCell(col);
		}

		public ExCell AddCell(Int32 rowNo, ExRow exRow, CellSpan span, String value, String dataType, String cellClass)
		{
			// first empty cell
			var row = GetRow(rowNo, exRow.Kind);
			var (cell, index) = row.AddCell();
			cell.Span = span;
			cell.SetValue(value, dataType);
			cell.StyleIndex = Styles.GetOrCreate(cell.GetStyle(row, cellClass));
			if (span.Col == 0 && span.Row == 0)
				return cell;
			if (span.Col > 0 && span.Row == 0)
				for (var c = 0; c < span.Col - 1; c++)  
					AddSpanCell(exRow.Kind, rowNo, index + c + 1).StyleIndex = cell.StyleIndex;
			else if (span.Col == 0 && span.Row > 0)
				for (var r = 0; r < span.Row - 1; r++)
					AddSpanCell(exRow.Kind, rowNo + r + 1, index).StyleIndex = cell.StyleIndex;
			else
				for (var c = 0; c < span.Col - 1; c++)
					for (var r = 0; r < span.Row - 1; r++)
						AddSpanCell(exRow.Kind, rowNo + r + 1, index + c + 1).StyleIndex = cell.StyleIndex;
			return cell;
		}

		public IEnumerable<ExRow> Rows => NumerateRows();

		private IEnumerable<ExRow> NumerateRows()
		{
			foreach (var r in _header)
				yield return r;
			foreach (var r in _body)
				yield return r;
			foreach (var r in _footer)
				yield return r;
		}

		public ExColumn AddColumn()
		{
			var col = new ExColumn();
			_cols.Add(col);
			return col;
		}
	}
}

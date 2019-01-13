// Copyright © 2019 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;

namespace A2v10.Interop.ExportTo
{
	public enum RowKind
	{
		thead,
		tfoot,
		tbody
	}

	public enum ExRowStyle
	{
		Default,
		Title,
		Parameter,
		LastParameter,
		Header,
		LightHeader,
		Footer,
		Total
	}

	public class ExRow
	{
		public RowRole Role { get; set; }
		public RowKind Kind { get; set; }
		public HorizontalAlign Align { get; set; }

		public IList<ExCell> Cells { get; } = new List<ExCell>();

		public (ExCell Cell, Int32 Index) AddCell()
		{
			for (var i = 0; i < Cells.Count; i++)
			{
				var cell = Cells[i];
				if (cell.Kind == CellKind.Null)
				{
					cell.Kind = CellKind.Normal;
					return (cell, i);
				}
			}
			var newCell = new ExCell();
			Cells.Add(newCell);
			return (newCell, Cells.Count - 1);
		}

		public ExCell SetSpanCell(Int32 col)
		{
			while (Cells.Count <= col)
				Cells.Add(new ExCell() { Kind = CellKind.Null });
			ExCell cell = Cells[col];
			cell.Kind = CellKind.Span;
			return cell;
		}

		public void SetRoleAndStyle(String strClass)
		{
			if (String.IsNullOrEmpty(strClass))
				return;
			var split = strClass.Split(' ');
			foreach (var cls in split)
			{
				if (cls.StartsWith("row"))
				{
					switch (cls)
					{
						case "row-header":
							Role = RowRole.Header;
							break;
						case "row-footer":
							Role = RowRole.Footer;
							break;
						case "row-title":
							Role = RowRole.Title;
							break;
						case "row-total":
							Role = RowRole.Total;
							break;
						case "row-parameter":
							Role = RowRole.Parameter;
							break;
					}
				}
				else if (cls.StartsWith("text"))
				{
					switch (cls)
					{
						case "text-center":
							Align = HorizontalAlign.Center;
							break;
						case "text-right":
							Align = HorizontalAlign.Right;
							break;
						case "text-left":
							Align = HorizontalAlign.Left;
							break;
					}
				}
			}
		}
	}
}

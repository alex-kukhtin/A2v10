﻿// Copyright © 2019 Alex Kukhtin. All rights reserved.

using System;
using System.IO;
using System.Collections.Generic;
using System.Xml;

using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Spreadsheet;

using A2v10.Interop.ExportTo;

/*TODO:
 * 3. ColumnWidth/RowHeight
 * 7. JS error - show error;
 */

namespace A2v10.Interop
{
	public class Html2Excel
	{
		List<String> _mergeCells = new List<String>();

		public Stream ConvertHtmlToExcel(String html)
		{
			HtmlReader rdr = new HtmlReader();
			var sheet = rdr.ReadHtmlSheet(html);
			return SheetToExcel(sheet);
		}

		public Stream SheetToExcel(ExSheet exsheet)
		{
			MemoryStream ms = null;
			ms = new MemoryStream();
			using (var doc = SpreadsheetDocument.Create(ms, SpreadsheetDocumentType.Workbook, true))
			{
				WorkbookPart wbPart = doc.AddWorkbookPart();
				wbPart.Workbook = new Workbook();
				WorksheetPart wsPart = wbPart.AddNewPart<WorksheetPart>();

				WorkbookStylesPart workStylePart = wbPart.AddNewPart<WorkbookStylesPart>();
				workStylePart.Stylesheet = AddStyles(exsheet.Styles);
				workStylePart.Stylesheet.Save();

				wsPart.Worksheet = GetDataFromSheet(exsheet);

				if (_mergeCells.Count > 0)
				{
					var mc = new MergeCells();
					foreach (var mergeRef in _mergeCells)
						mc.Append(new MergeCell() { Reference = mergeRef });
					wsPart.Worksheet.Append(mc);
				}

				Sheets sheets = doc.WorkbookPart.Workbook.AppendChild<Sheets>(new Sheets());
				Sheet sheet = new Sheet() { Id = doc.WorkbookPart.GetIdOfPart(wsPart), SheetId = 1, Name = "Report" };
				sheets.Append(sheet);

				wbPart.Workbook.Save();
				doc.Close();
			};
			return ms;
		}


		Stylesheet AddStyles(StylesDictionary styles)
		{
			Color autoColor() { return new Color() { Auto = true }; }

			Fonts fonts = new Fonts(
				new Font( // Index 0 - default
					new FontSize() { Val = 11 }

				),
				new Font( // Index 1 - bold
					new FontSize() { Val = 11 },
					new Bold()
				),
				new Font( // Index 2 - title
					new FontSize() { Val = 14 },
					new Bold()
				));

			Borders borders = new Borders(
					new Border(), // index 0 default
					new Border( // index 1 black border
						new LeftBorder(autoColor()) { Style = BorderStyleValues.Thin },
						new RightBorder(autoColor()) { Style = BorderStyleValues.Thin },
						new TopBorder(autoColor()) { Style = BorderStyleValues.Thin },
						new BottomBorder(autoColor()) { Style = BorderStyleValues.Thin },
						new DiagonalBorder())
				);

			Fills fills = new Fills(
					new Fill(new PatternFill() { PatternType = PatternValues.None }));

			NumberingFormats numFormats = new NumberingFormats(
					/*date*/     new NumberingFormat() { FormatCode = "dd\\.mm\\.yyyy;@", NumberFormatId = 166 },
					/*datetime*/ new NumberingFormat() { FormatCode = "dd\\.mm\\.yyyy hh:mm;@", NumberFormatId = 167 },
					/*currency*/ new NumberingFormat() { FormatCode = "#,##0.00####;[Red]\\-#,##0.00####", NumberFormatId = 169 },
					/*number*/   new NumberingFormat() { FormatCode = "#,##0.######;[Red]-#,##0.######", NumberFormatId = 170 }
				);

			CellFormats cellFormats = new CellFormats(new CellFormat());

			for (var i=1 /*1-based!*/; i< styles.List.Count; i++)
			{
				Style st = styles.List[i];
				cellFormats.Append(CreateCellFormat(st));
			}

			return new Stylesheet(numFormats, fonts, fills, borders, cellFormats);
		}

		CellFormat CreateCellFormat(Style style)
		{
			var cf = new CellFormat()
			{
				FontId = 0,
				ApplyAlignment = true,
				Alignment = new Alignment {
					Vertical = VerticalAlignmentValues.Top
				}
			};
			

			// font
			if (style.RowRole == RowRole.Title)
			{
				cf.FontId = 2;
				cf.ApplyFont = true;
			}
			else if (style.Bold)
			{
				cf.FontId = 1;
				cf.ApplyFont = true;
			}
			// dataType
			switch (style.DataType)
			{
				case DataType.Currency:
					cf.NumberFormatId = 169;
					cf.ApplyNumberFormat = true;
					break;
				case DataType.Date:
					cf.NumberFormatId = 166;
					cf.ApplyNumberFormat = true;
					break;
				case DataType.DateTime:
					cf.NumberFormatId = 167;
					cf.ApplyNumberFormat = true;
					break;
				case DataType.Number:
					break;
				default:
					cf.Alignment.WrapText = true;
					break;
			}
			// border
			if (style.HasBorder)
			{
				cf.BorderId = 1;
				cf.ApplyBorder = true;
			}

			// align
			if (style.DataType == DataType.Date || style.DataType == DataType.DateTime)
			{
				cf.Alignment.Horizontal = HorizontalAlignmentValues.Center;
			}

			if (style.Wrap)
				cf.Alignment.WrapText = true;

			switch (style.Align)
			{
				case HorizontalAlign.Center:
					cf.Alignment.Horizontal = HorizontalAlignmentValues.Center;
					break;
				case HorizontalAlign.Right:
					cf.Alignment.Horizontal = HorizontalAlignmentValues.Right;
					break;
			}
			return cf;
		}

		void SetCellValue(Cell cell, ExCell exCell, ExRow exRow)
		{
			cell.CellValue = new CellValue(exCell.Value);
			if (exCell.StyleIndex != 0)
				cell.StyleIndex = exCell.StyleIndex;
			if (exCell.Kind != CellKind.Normal)
				return;
			switch (exCell.DataType) {
				case DataType.String:
					cell.DataType = new EnumValue<CellValues>(CellValues.String);
					break;
				case DataType.Currency:
					cell.DataType = new EnumValue<CellValues>(CellValues.Number);
					break;
				case DataType.Number:
					cell.DataType = new EnumValue<CellValues>(CellValues.Number);
					break;
				case DataType.Date:
				case DataType.DateTime:
					// DataType not needed
					break;
			}
		}

		Row ProcessRow(ExRow exrow, Int32 rowNo)
		{
			var row = new Row();
			for (var col=0; col <exrow.Cells.Count; col++)
			{
				var c = exrow.Cells[col];
				if (c.Kind == CellKind.Null)
					continue;
				var cell = new Cell();
				SetCellValue(cell, c, exrow);
				cell.CellReference = c.Reference(rowNo, col);
				var mergeRef = c.MergeReference(rowNo, col);
				if (mergeRef != null)
					_mergeCells.Add(mergeRef);
				row.Append(cell);
			}
			return row;
		}

		void ProcessColums(Columns columns, XmlNode source)
		{
			Decimal chars = 8;
			Decimal charWidth = 7;
			var w = Math.Truncate((chars * charWidth + 5L) / charWidth * 256L) / 256L;

			columns.Append(new Column() { Min = 1, Max = 1, BestFit = true, CustomWidth = true, Width = Convert.ToDouble(w) });
			columns.Append(new Column() { Min = 2, Max = 2, Width = 20, CustomWidth = true, BestFit = true });
			columns.Append(new Column() { Min = 5, Max = 5, Width = 40, CustomWidth = true, BestFit = true });
		}

		Worksheet GetDataFromSheet(ExSheet sheet)
		{

			var sd = new SheetData();
			var cols = new Columns();

			ProcessColums(cols, null);

			Int32 rowNo = 0;
			foreach (var row in sheet.Rows)
				sd.Append(ProcessRow(row, rowNo++));

			var props = new SheetFormatProperties();
			props.BaseColumnWidth = 10;
			props.DefaultRowHeight = 30;
			props.DyDescent = 0.25;

			var ws = new Worksheet(props, cols, sd);
			return ws;
		}
	}
}

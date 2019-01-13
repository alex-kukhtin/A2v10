// Copyright © 2019 Alex Kukhtin. All rights reserved.

using System;
using System.IO;

using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Spreadsheet;
using System.Xml;
using System.Text.RegularExpressions;
using System.Collections.Generic;
using A2v10.Interop.ExportTo;

/*TODO:
 * 1. RowSpan
 * 2. Styles
 * 3. ColumnWidth/RowHeight
 * 4. Date, DateTime format
 * 5. Number format
 */

namespace A2v10.Interop
{
	public class Html2ExcelOld
	{
		List<String> _mergeCells = new List<String>();

		public Stream ConvertHtmlToExcel(String html)
		{
			MemoryStream ms = null;
			ms = new MemoryStream();
			using (var doc = SpreadsheetDocument.Create(ms, SpreadsheetDocumentType.Workbook, true))
			{
				WorkbookPart wbPart = doc.AddWorkbookPart();
				wbPart.Workbook = new Workbook();
				WorksheetPart wsPart = wbPart.AddNewPart<WorksheetPart>();

				WorkbookStylesPart workStylePart = wbPart.AddNewPart<WorkbookStylesPart>();
				workStylePart.Stylesheet = AddStyles();
				workStylePart.Stylesheet.Save();

				wsPart.Worksheet = GetDataFromHtml(GetXmlFromHtml(html));

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

		Stylesheet AddStyles()
		{
			Stylesheet styleSheet = null;

			Fonts fonts = new Fonts(
				new Font( // Index 0 - default
					new FontSize() { Val = 11 }

				),
				new Font( // Index 1 - header
					new FontSize() { Val = 10 },
					new Bold(),
					new Color() { Rgb = "777777" }
				));

			Fills fills = new Fills(
					new Fill(new PatternFill() { PatternType = PatternValues.None }), // Index 0 - default
					new Fill(new PatternFill() { PatternType = PatternValues.Gray125 }), // Index 1 - default
					new Fill(new PatternFill(new ForegroundColor { Rgb = new HexBinaryValue() { Value = "66666666" } })
					{
						PatternType = PatternValues.Solid
					}) // Index 2 - header
				);

			Borders borders = new Borders(
					new Border(), // index 0 default
					new Border( // index 1 black border
						new LeftBorder(new Color() { Auto = true }) { Style = BorderStyleValues.Thin },
						new RightBorder(new Color() { Auto = true }) { Style = BorderStyleValues.Thin },
						new TopBorder(new Color() { Auto = true }) { Style = BorderStyleValues.Thin },
						new BottomBorder(new Color() { Auto = true }) { Style = BorderStyleValues.Thin },
						new DiagonalBorder())
				);

			CellFormats cellFormats = new CellFormats(
					/*0*/ new CellFormat(), // default
					/*1*/ new CellFormat { FontId = 0, FillId = 0, BorderId = 0, ApplyNumberFormat = true, NumberFormatId = 4 }, // body
					/*2*/ new CellFormat { FontId = 1, FillId = 0, BorderId = 0}
				);

			styleSheet = new Stylesheet(fonts, fills, borders, cellFormats);

			return styleSheet;
		}


		XmlDocument GetXmlFromHtml(String html)
		{
			var rdr = new HtmlReader();
			var sht = rdr.ReadHtmlSheet(html);

			var reg = new Regex("<col ([\\w=\"\\s:%;]+)>");
			var xml = reg.Replace(html, (math) => $"<col {math.Groups[1].Value} />");
			var doc = new XmlDocument();
			doc.LoadXml(xml);
			return doc;
		}

		String NormalizeNumber(String number)
		{
			if (number.IndexOf(".") != -1)
				return new Regex(@"[\s,]").Replace(number, String.Empty);
			else
				return new Regex(@"[\s]").Replace(number, String.Empty).Replace(",", ".");
		}

		void SetCellValue(Cell cell, String text, XmlAttribute dataTypeAttr)
		{
			String strDataType = "string";
			if (dataTypeAttr != null)
				strDataType = dataTypeAttr.Value;
			switch (strDataType)
			{
				case "string":
					cell.CellValue = new CellValue(text);
					cell.DataType = new EnumValue<CellValues>(CellValues.String);
					break;
				case "currency":
					cell.CellValue = new CellValue(NormalizeNumber(text));
					cell.DataType = new EnumValue<CellValues>(CellValues.Number);
					//cell.StyleIndex = (UInt32)CellStyles.Number;
					break;
			}
		}

		Row ProcessRow(XmlNode node, Int32 rowNo)
		{
			var row = new Row();
			Char chIx = 'A';
			var style = node.Attributes["class"];
			foreach (var c in node.ChildNodes)
			{
				var cn = c as XmlNode;
				var cell = new Cell()
				{
					CellReference = $"{chIx}{rowNo}"
				};

				var dataType = cn.Attributes["data-type"];
				SetCellValue(cell, cn.InnerText, dataType);
				row.Append(cell);
				var colSpanAttr = cn.Attributes["colspan"];
				if (colSpanAttr != null)
				{
					var colSpan = Int32.Parse(colSpanAttr.Value);
					var mergeRef = $"{chIx}{rowNo}:{Char.ConvertFromUtf32(chIx + colSpan - 1)}{rowNo}";
					_mergeCells.Add(mergeRef);
					for (Int32 i = 0; i < colSpan - 1; i++)
						row.Append(new Cell() { CellReference = $"{++chIx}{rowNo}" });
				}
				chIx++;
			}
			/*
			sc.CellValue = new CellValue("12056439");
			sc.DataType = new EnumValue<CellValues>(CellValues.Number);
			sc.CellReference = $"A{rowNo}";
			row.Append(sc);
			sc = new Cell();
			sc.CellValue = new CellValue("I AM THE TEXT");
			sc.DataType = new EnumValue<CellValues>(CellValues.String);
			sc.CellReference = $"B{rowNo}";
			row.Append(sc);
			*/
			return row;
		}

		void ProcessColums(Columns columns, XmlNode source)
		{
			Decimal chars = 8;
			Decimal charWidth = 7;
			var w = Math.Truncate((chars * charWidth + 5L) / charWidth * 256L) / 256L;

			columns.Append(new Column() { Min = 1, Max = 1, BestFit = true, CustomWidth = true, Width = Convert.ToDouble(w) });
			columns.Append(new Column() { Min = 2, Max = 2, Width = 20, CustomWidth = true, BestFit = true });
		}

		Worksheet GetDataFromHtml(XmlDocument doc)
		{
			var table = doc.FirstChild;
			if (table.Name != "table")
				throw new InteropException("Invalid element for Html2Excel");

			var sd = new SheetData();
			var cols = new Columns();

			ProcessColums(cols, null);

			Int32 rowNo = 1;
			foreach (var n in table.ChildNodes)
			{
				var nd = n as XmlNode;
				switch (nd.Name)
				{
					case "colgroup":
						//foreach (var c in nd.ChildNodes)
						//ProcessColums(cols, c as XmlNode);
						break;
					case "tbody":
					case "thead":
					case "tfoot":
						foreach (var x in nd.ChildNodes)
							sd.Append(ProcessRow(x as XmlNode, rowNo++));
						break;
				}
			}
			var props = new SheetFormatProperties();
			props.BaseColumnWidth = 8;
			props.DefaultRowHeight = 20;
			props.DyDescent = 0.25;
			return new Worksheet(props, cols, sd);
		}
	}
}

// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.IO;
using System.Linq;
using System.Dynamic;
using System.Collections.Generic;

using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;

using A2v10.Data.Interfaces;

namespace A2v10.Interop
{
	public class ExcelParser : IDisposable
	{

		public String ErrorMessage { get; set; }

		public void Dispose()
		{
			Dispose(true);
		}

		protected virtual void Dispose(Boolean disposing)
		{

		}

		public Object ParseFile(Stream stream, ITableDescription table)
		{
			try
			{
				return ParseFileImpl(stream, table);
			}
			catch (FileFormatException ex)
			{
				String msg = ErrorMessage;
				if (String.IsNullOrEmpty(msg))
					msg = ex.Message;
				throw new InteropException(msg);
			}
		}

		Object ParseFileImpl(Stream stream, ITableDescription table)
		{
			if (table == null)
				throw new ArgumentNullException(nameof(table));

			var rv = new List<ExpandoObject>();

			using (var doc = SpreadsheetDocument.Open(stream, isEditable:false))
			{
				var workBookPart = doc.WorkbookPart;
				var workBook = workBookPart.Workbook;
				var sheet = workBook.Descendants<Sheet>().First();
				if (sheet == null)
					throw new InteropException($"The workbook does not have a sheet");
				var workSheetPart = (WorksheetPart) workBookPart.GetPartById(sheet.Id);
				var sharedStringPart = workBookPart.SharedStringTablePart;
				var sharedStringTable = sharedStringPart.SharedStringTable;

				var rows = workSheetPart.Worksheet.Descendants<Row>().ToList();
				if (rows == null)
					throw new InteropException($"The sheet does not have a rows");

				var hdr = rows[0];

				List<String> columns = new List<String>();

				var hdrCells = hdr.Elements<Cell>().ToList();
				for (var ci = 0; ci < hdrCells.Count; ci++)
				{
					var c = hdrCells[ci];
					if (c.DataType != null && c.DataType == CellValues.SharedString)
					{
						Int32 ssid = Int32.Parse(c.CellValue.Text);
						String str = sharedStringTable.ChildElements[ssid].InnerText;
						columns.Add(str);
					}
				}
				for (var ri=1 /*1!*/; ri<rows.Count; ri++)
				{
					var r = rows[ri];
					var dataRow = table.NewRow();
					var cells = r.Elements<Cell>().ToList();
					for (var ci = 0; ci < cells.Count; ci++)
					{
						var c = cells[ci];
						var colIndex = ToIndex(c.CellReference) - 1;
						if (c.DataType != null && c.DataType == CellValues.SharedString)
						{
							Int32 ssid = Int32.Parse(c.CellValue.Text);
							String str = sharedStringTable.ChildElements[ssid].InnerText;
							table.SetValue(dataRow, columns[colIndex], str);
						}
						else if (c.CellValue != null)
							table.SetValue(dataRow, columns[colIndex], c.CellValue.Text);
					}
				}
			}
			return table.ToObject();
		}

		Int32 ToIndex(String refs)
		{
			Int32 ci = 0;
			refs = refs.ToUpper();
			for (Int32 ix = 0; ix < refs.Length && refs[ix] >= 'A'; ix++)
				ci = (ci * 26) + ((Int32) refs[ix] - 64);
			return ci;
		}
	}
}

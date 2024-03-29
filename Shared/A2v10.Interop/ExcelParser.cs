﻿// Copyright © 2015-2023 Oleksandr Kukhtin. All rights reserved.

using System;
using System.IO;
using System.Linq;
using System.Dynamic;
using System.Collections.Generic;
using System.Globalization;

using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;

using A2v10.Data.Interfaces;

namespace A2v10.Interop;

public class ExeclParseResult
{
	public ExpandoObject Data { get; set; }
	public List<String> Columns { get; set; }
}

public class ExcelParser : IDisposable
{

	public String ErrorMessage { get; set; }
	public List<ExcelFormatError> Errors { get; } = new();

	public void Dispose()
	{
		Dispose(true);
	}

	protected virtual void Dispose(Boolean disposing)
	{

	}

	public ExeclParseResult CreateDataModel(Stream stream)
	{
		var table = new FlatTableHandler();
		return ParseFile(stream, table);
	}

	String ReplaceUnacceptableChars(String str)
	{
		return str.Replace('.', '_').Replace('!', '_');
	}

	public ExeclParseResult ParseFile(Stream stream, ITableDescription table)
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

	ExeclParseResult ParseFileImpl(Stream stream, ITableDescription table)
	{
		if (table == null)
			throw new ArgumentNullException(nameof(table));

		var rv = new List<ExpandoObject>();

		List<String> columns = new();

		using (var doc = SpreadsheetDocument.Open(stream, isEditable:false))
		{
			var workBookPart = doc.WorkbookPart;
			var workBook = workBookPart.Workbook;
			var sheet = workBook.Descendants<Sheet>().First() 
				?? throw new InteropException($"The workbook does not have a sheet");
			var workSheetPart = (WorksheetPart) workBookPart.GetPartById(sheet.Id);
			var sharedStringPart = workBookPart.SharedStringTablePart;
			var sharedStringTable = sharedStringPart.SharedStringTable;

			var stylesPart = workBookPart.WorkbookStylesPart;
			// This formats is NUMBER, not standard!
			var numFormats = stylesPart.Stylesheet
				.Descendants<NumberingFormat>()?
				.GroupBy(x => x.NumberFormatId.Value.ToString())
				.ToDictionary(g => g.Key, g => g.First());

            var rows = workSheetPart.Worksheet.Descendants<Row>().ToList() 
				?? throw new InteropException($"The sheet does not have a rows");
			var hdr = rows[0];

			var hdrCells = hdr.Elements<Cell>().ToList();
			for (var ci = 0; ci < hdrCells.Count; ci++)
			{
				var c = hdrCells[ci];
				if (c.DataType != null && c.DataType == CellValues.SharedString)
				{
					Int32 ssid = Int32.Parse(c.CellValue.Text);
					String str = sharedStringTable.ChildElements[ssid].InnerText;
					str = ReplaceUnacceptableChars(str);
					columns.Add(str);
				}
				else
				{
					columns.Add($"Empty-{ci}");
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
						try
						{
							table.SetValue(dataRow, columns[colIndex], str);
						} 
						catch (Exception ex)
						{
							Errors.Add(new ExcelFormatError()
							{
								Message = ex.Message,
								CellReference = c.CellReference,
								Value = str
							});
						}
					}
					else if (c.StyleIndex != null && c.CellValue != null)
					{
						Int32 ix = Int32.Parse(c.StyleIndex);
						var cellFormat = workBookPart.WorkbookStylesPart.Stylesheet.CellFormats.ChildElements[ix] as CellFormat;
						var fmtId = cellFormat?.NumberFormatId;
						if (numFormats != null &&  numFormats.ContainsKey(fmtId))
						{
							// number
							if (Double.TryParse(c.CellValue.Text, NumberStyles.Any, CultureInfo.InvariantCulture, out Double dblVal))
								table.SetValue(dataRow, columns[colIndex], dblVal);
							else
								throw new InteropException($"invalid cell value '{c.CellValue.Text}' for format '{cellFormat.InnerText}'");
						}
						else
						{
							Object cellVal = GetCellValue(c.CellValue.Text, cellFormat);
							if (cellVal != null)
								table.SetValue(dataRow, columns[colIndex], cellVal);
						}
					}
					else if (c.CellValue != null)
						table.SetValue(dataRow, columns[colIndex], c.CellValue.Text);
				}
			}
		}

		if (Errors.Count > 0)
		{
			var msg = String.Join<String>("\n", Errors.Select(x => $"{x.CellReference}: '{x.Value}' => '{x.Message}'"));
			throw new InteropException(msg);
		}

		return new ExeclParseResult()
		{
			Data = table.ToObject(),
			Columns = columns
		};
	}

	Object GetCellValue(String text, CellFormat format)
	{
		if (format == null)
			return text;
		var formatId = format.NumberFormatId;
		var strFormat = ExcelFormats.GetDateTimeFormat(formatId);
		if (!String.IsNullOrEmpty(strFormat))
		{
			if (Double.TryParse(text, NumberStyles.Any, CultureInfo.InvariantCulture, out Double dblDate))
				return DateTime.FromOADate(dblDate);
		}
		else if (ExcelFormats.IsNumberFormat(formatId))
		{
			// hack
			if (Double.TryParse(text, NumberStyles.Any, CultureInfo.InvariantCulture, out Double dblVal))
				return dblVal;
		}
		return text;
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

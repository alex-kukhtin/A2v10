// Copyright © 2015-2023 Oleksandr Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Dynamic;
using System.Globalization;

using DocumentFormat.OpenXml.Spreadsheet;
using DocumentFormat.OpenXml.Packaging;

using A2v10.Data.Interfaces;
using DocumentFormat.OpenXml;

namespace A2v10.Interop;

class RowSetDef
{
	internal String SheetName;
	internal String PropertyName;
	internal IList<Row> Rows;
	internal IList<Row> RowsForClone;
	internal UInt32 FirstRow;
	internal UInt32 RowCount;
	internal UInt32 LastRow;
	internal void Clear()
	{
		Rows = null;
		RowsForClone = null;	
	}
}

class SharedStringDef
{
	internal SharedStringItem Item;
	internal String Expression;
	internal Int32 iIndex;
	Boolean bParsed = false;

	internal SharedStringDef(SharedStringItem itm, Int32 ix)
	{
		Item = itm;
		iIndex = ix;
	}

	internal Boolean Parse()
	{
		if (bParsed)
			return true;

		String str = Item.Text.Text;
		if (str.StartsWith("{") && str.EndsWith("}"))
		{
			Expression = str.Substring(1, str.Length - 2);
			bParsed = true;
			return true;
		}
		return false;
	}
}


public class ExcelReportGenerator : IDisposable
{
	IDataModel _dataModel;
	SharedStringTable _sharedStringTable;
	Dictionary<String, SharedStringDef> _sharedStringMap;
	Dictionary<Int32, SharedStringDef> _sharedStringIndexMap;

	readonly String _templateFile;
	readonly Stream _templateStream;
	String _resultFile;

	Boolean _sharedStringModified = false;
	Int32 _sharedStringCount = 0;

	public ExcelReportGenerator(String templateFile)
	{
		_templateFile = templateFile;
	}

	public ExcelReportGenerator(Stream templateStream)
	{
		_templateStream = templateStream;

	}

	public void Dispose()
	{
		Dispose(true);
	}

	protected virtual void Dispose(Boolean disposing)
	{
		if (disposing)
		{
			var r = _resultFile;
            _resultFile = null;
            if (r != null)
				File.Delete(r);
			_templateStream?.Close();
			_templateStream?.Dispose();
		}
	}

	public String ResultFile => _resultFile;

	private Dictionary<String, Dictionary<String, RowSetDef>> CreateDataSetRows(Workbook workbook)
	{
		var result = new Dictionary<String, Dictionary<String, RowSetDef>>();

		var defNames = workbook?.DefinedNames?.Elements<DefinedName>();
		if (defNames == null)
			return result;

        foreach (var defName in defNames)
		{
			var df = GetDefinedName(defName);
			if (df == null)
				continue;
			if (!result.TryGetValue(df.SheetName, out var rdict))
			{
				rdict = new Dictionary<String, RowSetDef>();
				var sheetName = df.SheetName;
				if (sheetName.StartsWith("'") && sheetName.EndsWith("'"))
					sheetName = sheetName.Substring(1, sheetName.Length - 2);
				result.Add(sheetName, rdict);
			}
			rdict.Add(df.PropertyName, df);
		}
        return result;
	}

	public void GenerateReport(IDataModel dataModel)
	{
		_dataModel = dataModel;
		String tempFileName = Path.GetTempFileName();
		File.Delete(tempFileName);
		if (_templateStream != null) {
			using var br = new FileStream(tempFileName, FileMode.Create);
			_templateStream.CopyTo(br);
		}
		else if (_templateFile != null)
			File.Copy(_templateFile, tempFileName);
		else
			throw new InteropException("Template file or template stream is required");
		SpreadsheetDocument doc = null;
		try {
			// Stream is not working ?
			doc = SpreadsheetDocument.Open(tempFileName, isEditable: true);

			_sharedStringTable = doc.WorkbookPart.SharedStringTablePart.SharedStringTable;
			PrepareSharedStringTable();

			var workBook = doc.WorkbookPart.Workbook;
			var dataSetRows = CreateDataSetRows(workBook);

			_sharedStringCount = _sharedStringTable.Elements<SharedStringItem>().Count<SharedStringItem>();

			foreach (var workSheetPart in doc.WorkbookPart.WorksheetParts)
			{
				//var workSheetPart = doc.WorkbookPart.WorksheetParts.First<WorksheetPart>();
				var workSheet = workSheetPart.Worksheet;
				var sheetData = workSheet.GetFirstChild<SheetData>();

				var relationshipId = doc.WorkbookPart.GetIdOfPart(workSheetPart);
				var sheet = workBook.Sheets.Elements<Sheet>().First(s => s.Id == relationshipId);

				dataSetRows.TryGetValue(sheet.Name, out var ds);	
				var modified = ProcessData(ds, sheetData);

				foreach (var row in sheetData.Elements<Row>()) 
				{ 
					CorrectCellAddresses(row);
				}

                workSheet.AddChild(new IgnoredErrors(
                    new IgnoredError()
                    {
                        NumberStoredAsText = true,
                        SequenceOfReferences = new ListValue<StringValue>(
                            new List<StringValue>() { new StringValue("A1:WZZ999999") })
                    }
                ));

                if (modified)
					workSheet.Save();
			}

			if (_sharedStringModified)
				_sharedStringTable.Save();
		}
		finally
		{
			doc?.Dispose();
		}
		_resultFile = tempFileName;
	}

	void PrepareSharedStringTable()
	{
		var sslist = _sharedStringTable.Elements<SharedStringItem>().ToList();
		for (Int32 i = 0; i < sslist.Count; i++)
		{
			var ssitem = sslist[i];
			String str = ssitem.Text.Text;
			if (!str.StartsWith("{"))
				continue;
			_sharedStringMap ??= new Dictionary<String, SharedStringDef>();
			_sharedStringIndexMap ??= new Dictionary<Int32, SharedStringDef>();
			var ssd = new SharedStringDef(ssitem, i);
			_sharedStringMap.Add(str, ssd);
			_sharedStringIndexMap.Add(i, ssd);
		}
	}

	RowSetDef GetDefinedName(DefinedName dn)
	{
		String name = dn.Name;
		if (!name.StartsWith("_") || !name.EndsWith("_"))
			return null;
		String propName = name.Substring(1, name.Length - 2);
		String showRef = dn.Text;
		Int32 exclPos = showRef.IndexOf('!');
		if (exclPos == -1)
			return null;
		String shtName = showRef.Substring(0, exclPos);
		String shtRef = showRef.Substring(exclPos + 1);
		Int32 colonPos = shtRef.IndexOf(':');
		if (colonPos == -1)
			return null;
		String startRef = shtRef.Substring(0, colonPos); // link to the first line of the range
		String endRef = shtRef.Substring(colonPos + 1);  // link to the second line of the range
		if (startRef.Length < 2)
			return null;
		if (endRef.Length < 2)
			return null;
		UInt32 startRow = 0;
		UInt32 endRow = 0;
		if (startRef[0] == '$')
		{
			if (!UInt32.TryParse(startRef.Substring(1), out startRow))
				return null;
		}
		if (endRef[0] == '$')
		{
			if (!UInt32.TryParse(endRef.Substring(1), out endRow))
				return null;
		}
		return new()
		{
			SheetName = shtName,	
			PropertyName = propName,
			FirstRow = startRow,
			LastRow = endRow,
			RowCount = endRow - startRow + 1
		};
	}

	Boolean ProcessData(Dictionary<String, RowSetDef> datasetRows, SheetData sheetData)
	{

		ProcessPlainTable(datasetRows, sheetData);

		if (datasetRows != null)
		{
			return ProcessDataSets(datasetRows, sheetData);
		}
		return false;
	}

	Boolean IsRowInRange(Dictionary<String, RowSetDef> datasetRows, UInt32 rowIndex)
	{
		if (datasetRows == null)
			return false;
		foreach (var rd in datasetRows)
		{
			var rdv = rd.Value;
			if (rowIndex >= rdv.FirstRow && rowIndex <= rdv.LastRow)
				return true;
		}
		return false;
	}

	void ProcessPlainTable(Dictionary<String, RowSetDef> datasetRows, SheetData sheetData)
	{
		var rows = sheetData.Elements<Row>();
		foreach (var row in rows)
		{
			if (IsRowInRange(datasetRows, row.RowIndex))
				continue;
			foreach (var cell in row.Elements<Cell>())
			{
				SetCellData(cell, _dataModel.Root);
			}
		}
	}

	Boolean ProcessDataSets(Dictionary<String, RowSetDef> datasetRows, SheetData sheetData)
	{
		var result = false;
		foreach (var dataSet in datasetRows)
		{
			IList<ExpandoObject> list = _dataModel.Eval<List<ExpandoObject>>(dataSet.Key) 
				?? throw new InteropException($"The data model does not have a '{dataSet.Key}' property ");
			RowSetDef def = dataSet.Value;
			if (list.Count == 0)
			{
				// no records - delete range
				for (Int32 i = 0; i <def.RowCount; i++)
				{
					var row = sheetData.Elements<Row>().First<Row>(r => r.RowIndex == def.FirstRow + i);
					row.Remove();
				}
				result = true;
			}
			else
			{
				UInt32 count = 0;
				for (Int32 i = 0; i < list.Count; i++)
				{
					var lr = InsertRowFromTemplate(sheetData, def, ref count);
					result = true;
					var listData = list[i];
					SetRecordData(def, listData);
				}
			}
		}
		return result;
	}

	void SetRecordData(RowSetDef def, ExpandoObject data)
	{
		// just an index (for now)
		foreach (var r in def.Rows)
		{
			foreach (var c in r.Elements<Cell>())
			{
				SetCellData(c, data);
			}
		}
	}

	void SetCellData(Cell cell, ExpandoObject data)
	{
		if (cell.DataType == null)
			return;
		if (cell.DataType != CellValues.SharedString)
			return;
		if (_sharedStringIndexMap == null)
			return;
		String addr = cell.CellValue.Text.ToString();
		// this is the line number from SharedStrings
		if (!Int32.TryParse(addr, out Int32 strIndex))
			return;
		if (!_sharedStringIndexMap.ContainsKey(strIndex))
			return;
		SharedStringDef ssd = _sharedStringIndexMap[strIndex];
		if (ssd == null)
			return;
		if (ssd.Parse())
		{
			Object dat = _dataModel.Eval<Object>(data, ssd.Expression);
			SetCellValueData(cell, dat);
		}
	}

	void SetCellValueData(Cell cell, Object obj)
	{
		if (obj == null)
		{
			cell.DataType = null;
			cell.CellValue = null;
		}
		else if (obj is String strVal)
		{
			cell.DataType = CellValues.SharedString;
			cell.CellValue = new CellValue(NewSharedString(strVal));
		}
		else if (obj is DateTime dt)
		{
			var cv = new CellValue
			{
				Text = dt.ToOADate().ToString(CultureInfo.InvariantCulture)
			};
			// CellValues.Date supported in Office2010 only
			cell.DataType = CellValues.Number;
			cell.CellValue = cv;
		}
		else if (obj is TimeSpan ts)
		{
			cell.DataType = CellValues.Date;
			DateTime dtv = new(ts.Ticks);
			cell.CellValue = new CellValue(dtv.ToOADate().ToString(CultureInfo.InvariantCulture));
		}
		else if (obj is Double dblVal)
		{
			cell.DataType = CellValues.Number;
			cell.CellValue = new CellValue(dblVal.ToString(CultureInfo.InvariantCulture));
		}
		else if (obj is Decimal decVal)
		{
			cell.DataType = CellValues.Number;
			cell.CellValue = new CellValue(decVal.ToString(CultureInfo.InvariantCulture));
		}
		else if (obj is Int64 int64Val)
		{
			cell.DataType = CellValues.Number;
			cell.CellValue = new CellValue(int64Val.ToString());
		}
		else if (obj is Int32 int32Val)
		{
			cell.DataType = CellValues.Number;
			cell.CellValue = new CellValue(int32Val.ToString());
		}
		else if (obj is Int16 int16Val)
		{
			cell.DataType = CellValues.Number;
			cell.CellValue = new CellValue(int16Val.ToString());
		}
		else if (obj is Boolean boolVal)
		{
			cell.DataType = CellValues.Boolean;
			cell.CellValue = new CellValue(boolVal.ToString());
		}
	}

	String NewSharedString(String Value)
	{
		var ssi = new SharedStringItem();
		ssi.Append(new Text(Value));
		_sharedStringTable.Append(ssi);
		_sharedStringModified = true;
		return (_sharedStringCount++).ToString();
	}


	Row InsertRowFromTemplate(SheetData sheetData, RowSetDef rd, ref UInt32 count)
	{
		Row lastRow = null;
		if (rd.Rows == null)
		{
			// строки еще нет, нужно ее найти
			var row = sheetData.Elements<Row>().First<Row>(r => r.RowIndex == rd.FirstRow);
			rd.Rows = new List<Row>();
			rd.RowsForClone = new List<Row>();
			for (Int32 i = 0; i < rd.RowCount; i++)
			{
				rd.Rows.Add(row);
				rd.RowsForClone.Add(row.Clone() as Row); // and for cloning too!
				row = row.NextSibling<Row>();
				lastRow = row;
			}
		}
		else
		{
			// The line was already there, you need to clone it and insert it below
			lastRow = rd.Rows[rd.Rows.Count - 1];
			// next row index
			UInt32 nri = rd.Rows[0].RowIndex.Value + rd.RowCount;
			for (Int32 i = 0; i < rd.Rows.Count; i++)
			{
				var sr = rd.RowsForClone[i];
				var nr = sr.Clone() as Row;
				nr.RowIndex = nri++;
				var insertedRow = sheetData.InsertAfter<Row>(nr, lastRow);
				CorrectRowIndex(insertedRow);
				count++;
				rd.Rows[i] = nr;
				lastRow = nr; // the last one is already inserted
            }
        }
		return lastRow;
	}
    void CorrectRowIndex(Row insertedRow)
	{
		if (insertedRow == null)
			return;
        var nextRow = insertedRow.NextSibling<Row>();
		while (nextRow != null) {
			nextRow.RowIndex += 1;
			nextRow = nextRow.NextSibling<Row>();
		}
    }


    void CorrectCellAddresses(Row row)
	{
		foreach (var c in row.ChildElements)
		{
			var clch = c as Cell;
			var cr = clch.CellReference.ToString();
			var crn = new String(cr.Where(Char.IsLetter).ToArray());
			clch.CellReference = crn + row.RowIndex.ToString();
		}
	}
}

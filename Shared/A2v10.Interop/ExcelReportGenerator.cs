// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Linq;
using DocumentFormat.OpenXml.Spreadsheet;
using DocumentFormat.OpenXml.Packaging;
using A2v10.Data.Interfaces;
using System.IO;
using System.Dynamic;
using System.Globalization;

namespace A2v10.Interop
{

	class RowSetDef
	{
		internal IList<Row> Rows;
		internal IList<Row> RowsForClone;
		internal UInt32 FirstRow;
		internal UInt32 RowCount;
		internal UInt32 LastRow;
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
		private SheetData _sheetData;

		IDataModel _dataModel;
		SharedStringTable _sharedStringTable;
		Dictionary<String, RowSetDef> _dataSetRows;
		Dictionary<String, SharedStringDef> _sharedStringMap;
		Dictionary<Int32, SharedStringDef> _sharedStringIndexMap;

		readonly String _templateFile;
		readonly Stream _templateStream;
		String _resultFile;

		Boolean _sharedStringModified = false;
		Boolean _wrkshtModified = false;

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
				if (_resultFile != null)
					File.Delete(_resultFile);
				_resultFile = null;
				if (_templateStream != null)
				{
					_templateStream.Close();
					_templateStream.Dispose();
				}
			}
		}

		public String ResultFile => _resultFile;

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
				var workSheetPart = doc.WorkbookPart.WorksheetParts.First<WorksheetPart>();
				_sharedStringTable = doc.WorkbookPart.SharedStringTablePart.SharedStringTable;
				PrepareSharedStringTable();
				var workSheet = workSheetPart.Worksheet;
				_sheetData = workSheet.GetFirstChild<SheetData>();

				var workBook = doc.WorkbookPart.Workbook;
				var defName = workBook?.DefinedNames?.FirstChild;
				while (defName != null)
				{
					if (defName is DefinedName dn)
					{
						CheckDefinedName(dn);
					}
					defName = defName.NextSibling();
				}

				ProcessData();

				if (_sharedStringModified)
					_sharedStringTable.Save();
				if (_wrkshtModified)
					workSheet.Save();
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

		void CheckDefinedName(DefinedName dn)
		{
			String name = dn.Name;
			if (!name.StartsWith("_") || !name.EndsWith("_"))
				return;
			String propName = name.Substring(1, name.Length - 2);
			String showRef = dn.Text;
			Int32 exclPos = showRef.IndexOf('!');
			if (exclPos == -1)
				return;
			String shtName = showRef.Substring(0, exclPos);
			String shtRef = showRef.Substring(exclPos + 1);
			Int32 colonPos = shtRef.IndexOf(':');
			if (colonPos == -1)
				return;
			String startRef = shtRef.Substring(0, colonPos); // link to the first line of the range
			String endRef = shtRef.Substring(colonPos + 1);  // link to the second line of the range
			if (startRef.Length < 2)
				return;
			if (endRef.Length < 2)
				return;
			UInt32 startRow = 0;
			UInt32 endRow = 0;
			if (startRef[0] == '$')
			{
				if (!UInt32.TryParse(startRef.Substring(1), out startRow))
					return;
			}
			if (endRef[0] == '$')
			{
				if (!UInt32.TryParse(endRef.Substring(1), out endRow))
					return;
			}
			_dataSetRows ??= new Dictionary<String, RowSetDef>();
			RowSetDef rd = new()
			{
				FirstRow = startRow,
				LastRow = endRow,
				RowCount = endRow - startRow + 1
			};
			_dataSetRows.Add(propName, rd);
		}

		Int32 _sharedStringCount = 0;

		void ProcessData()
		{
			_sharedStringCount = _sharedStringTable.Elements<SharedStringItem>().Count<SharedStringItem>();

			ProcessPlainTable();

			if (_dataSetRows != null)
				ProcessDataSets();
		}

		Boolean IsRowInRange(UInt32 rowIndex)
		{
			if (_dataSetRows == null)
				return false;
			foreach (var rd in _dataSetRows)
			{
				var rdv = rd.Value;
				if (rowIndex >= rdv.FirstRow && rowIndex <= rdv.LastRow)
					return true;
			}
			return false;
		}

		void ProcessPlainTable()
		{
			var rows = _sheetData.Elements<Row>();
			foreach (var row in rows)
			{
				if (IsRowInRange(row.RowIndex))
					return;
				foreach (var cell in row.Elements<Cell>())
				{
					SetCellData(cell, _dataModel.Root);
				}
			}
		}

		void ProcessDataSets()
		{ 
			foreach (var dataSet in _dataSetRows)
			{
				IList<ExpandoObject> list = _dataModel.Eval<List<ExpandoObject>>(dataSet.Key) 
					?? throw new InteropException($"The data model does not have a '{dataSet.Key}' property ");
				RowSetDef def = dataSet.Value;
				if (list.Count == 0)
				{
					// no records - delete range
					for (Int32 i = 0; i <def.RowCount; i++)
					{
						var row = _sheetData.Elements<Row>().First<Row>(r => r.RowIndex == def.FirstRow + i);
						row.Remove();
					}
					_wrkshtModified = true;
				}
				else
				{
					UInt32 count = 0;
					Row lr = null;
					for (Int32 i = 0; i < list.Count; i++)
					{
						lr = InsertRowFromTemplate(def, ref count);
						_wrkshtModified = true;
						SetRecordData(def, list[i]);
					}
				}
			}
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


		Row InsertRowFromTemplate(RowSetDef rd, ref UInt32 count)
		{
			Row lastRow = null;
			if (rd.Rows == null)
			{
				// строки еще нет, нужно ее найти
				var row = _sheetData.Elements<Row>().First<Row>(r => r.RowIndex == rd.FirstRow);
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
					CorrectCellAddresses(nr);
					_sheetData.InsertAfter<Row>(nr, lastRow);
					count++;
					rd.Rows[i] = nr;
					lastRow = nr; // the last one is already inserted
				}
			}
			return lastRow;
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
}

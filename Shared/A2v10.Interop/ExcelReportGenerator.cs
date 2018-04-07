// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DocumentFormat.OpenXml;
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
	}

	class SharedStringDef
	{
		internal SharedStringItem Item;
		internal String Expression;
		internal int iIndex;
		bool bParsed = false;

		internal SharedStringDef(SharedStringItem itm, int ix)
		{
			Item = itm;
			iIndex = ix;
		}

		internal void Parse()
		{
			if (bParsed)
				return;

			String str = Item.Text.Text;
			if (str.StartsWith("{") && str.EndsWith("}"))
			{
				Expression = str.Substring(1, str.Length - 2);
			}
			bParsed = true;
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

		String _templateFile;
		String _resultFile;

		Boolean _sharedStringModified = false;
		Boolean _wrkshtModified = false;

		public ExcelReportGenerator(String templateFile)
		{
			_templateFile = templateFile;
		}

		public void Dispose()
		{
			if (_resultFile != null)
				File.Delete(_resultFile);
			_resultFile = null;
		}

		public String ResultFile => _resultFile;

		public void GenerateReport(IDataModel dataModel)
		{
			_dataModel = dataModel;
			String tempFileName = Path.GetTempFileName();
			File.Delete(tempFileName);
			File.Copy(_templateFile, tempFileName);
			using (var doc = SpreadsheetDocument.Open(tempFileName, isEditable: true))
			{
				var workSheetPart = doc.WorkbookPart.WorksheetParts.First<WorksheetPart>();
				_sharedStringTable = doc.WorkbookPart.SharedStringTablePart.SharedStringTable;
				PrepareSharedStringTable();
				var workSheet = workSheetPart.Worksheet;
				_sheetData = workSheet.GetFirstChild<SheetData>();

				var workBook = doc.WorkbookPart.Workbook;
				var defName = workBook.DefinedNames.FirstChild;
				while (defName != null)
				{
					var dn = defName as DefinedName;
					if (dn != null)
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
				doc.Close();
			}
			_resultFile = tempFileName;
		}

		void PrepareSharedStringTable()
		{
			var sslist = _sharedStringTable.Elements<SharedStringItem>().ToList();
			for (int i = 0; i < sslist.Count; i++)
			{
				var ssitem = sslist[i];
				String str = ssitem.Text.Text;
				if (!str.StartsWith("{"))
					continue;
				if (_sharedStringMap == null)
					_sharedStringMap = new Dictionary<String, SharedStringDef>();
				if (_sharedStringIndexMap == null)
					_sharedStringIndexMap = new Dictionary<int, SharedStringDef>();
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
			int exclPos = showRef.IndexOf('!');
			if (exclPos == -1)
				return;
			String shtName = showRef.Substring(0, exclPos);
			String shtRef = showRef.Substring(exclPos + 1);
			int colonPos = shtRef.IndexOf(':');
			if (colonPos == -1)
				return;
			String startRef = shtRef.Substring(0, colonPos); // ссылка на первую строку дипазона
			String endRef = shtRef.Substring(colonPos + 1);  // ссылка на вторую строку диапазона
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
			if (_dataSetRows == null)
				_dataSetRows = new Dictionary<String, RowSetDef>();
			RowSetDef rd = new RowSetDef();
			rd.FirstRow = startRow;
			rd.RowCount = endRow - startRow + 1;
			_dataSetRows.Add(propName, rd);
		}

		Int32 _sharedStringCount = 0;

		void ProcessData()
		{
			_sharedStringCount = _sharedStringTable.Elements<SharedStringItem>().Count<SharedStringItem>();

			if (_dataSetRows != null)
				ProcessDataSets();
		}

		void ProcessDataSets()
		{ 
			foreach (var dataSet in _dataSetRows)
			{
				IList<ExpandoObject> list = _dataModel.Eval<List<ExpandoObject>>(dataSet.Key);
				if (list == null)
				{
					throw new InteropException($"The data model does not have a '{dataSet.Key}' property ");
				}
				RowSetDef def = dataSet.Value;
				UInt32 count = 0;
				Row lr = null;
				for (Int32 i=0; i<list.Count; i++)
				{
					lr = InsertRowFromTemplate(def, ref count);
					_wrkshtModified = true;
					SetRecordData(def, list[i]);
				}
			}
		}

		void SetRecordData(RowSetDef def, ExpandoObject data)
		{
			// Пока просто индекс
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
			// это номер строки из SharedStrings
			Int32 strIndex = 0;
			if (!Int32.TryParse(addr, out strIndex))
				return;
			if (!_sharedStringIndexMap.ContainsKey(strIndex))
				return;
			SharedStringDef ssd = _sharedStringIndexMap[strIndex];
			if (ssd == null)
				return;
			ssd.Parse();
			Object dat = _dataModel.Eval<Object>(data, ssd.Expression);
			SetCellValueData(cell, dat);
		}

		void SetCellValueData(Cell cell, Object obj)
		{
			if (obj == null)
			{
				cell.DataType = null;
				cell.CellValue = null;
			}
			else if (obj is String)
			{
				cell.DataType = CellValues.SharedString;
				cell.CellValue = new CellValue(NewSharedString(obj as String));
			}
			else if (obj is DateTime)
			{
				DateTime dt = (DateTime)obj;
				var cv = new CellValue();
				cv.Text = dt.ToOADate().ToString(CultureInfo.InvariantCulture);
				// CellValues.Date supported in Office2010 only
				cell.DataType = CellValues.Number; 
				cell.CellValue = cv;
			}
			else if (obj is TimeSpan)
			{
				cell.DataType = CellValues.Date;
				TimeSpan ts = (TimeSpan)obj;
				DateTime dt = new DateTime(ts.Ticks);
				cell.CellValue = new CellValue(dt.ToOADate().ToString(CultureInfo.InvariantCulture));
			}
			else if (obj is Double)
			{
				cell.DataType = CellValues.Number;
				cell.CellValue = new CellValue(((Double)obj).ToString(CultureInfo.InvariantCulture));
			}
			else if (obj is Decimal)
			{
				cell.DataType = CellValues.Number;
				cell.CellValue = new CellValue(((Decimal)obj).ToString(CultureInfo.InvariantCulture));
			}
			else if (obj is Int64)
			{
				cell.DataType = CellValues.Number;
				cell.CellValue = new CellValue(((Int64)obj).ToString());
			}
			else if (obj is Int32)
			{
				cell.DataType = CellValues.Number;
				cell.CellValue = new CellValue(((Int32)obj).ToString());
			}
			else if (obj is Int16)
			{
				cell.DataType = CellValues.Number;
				cell.CellValue = new CellValue(((Int16)obj).ToString());
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
				for (int i = 0; i < rd.RowCount; i++)
				{
					rd.Rows.Add(row);
					rd.RowsForClone.Add(row.Clone() as Row); // и для клонирования тоже!
					row = row.NextSibling<Row>();
					lastRow = row;
				}
			}
			else
			{
				// Строка уже была, нужно ее клонировать и вставить ниже
				lastRow = rd.Rows[rd.Rows.Count - 1];
				// индекс следующей вставляемой строки
				UInt32 nri = rd.Rows[0].RowIndex.Value + rd.RowCount;
				for (int i = 0; i < rd.Rows.Count; i++)
				{
					var sr = rd.RowsForClone[i];
					var nr = sr.Clone() as Row;
					nr.RowIndex = nri++;
					CorrectCellAddresses(nr);
					_sheetData.InsertAfter<Row>(nr, lastRow);
					count++; // вставили строку
					rd.Rows[i] = nr; // Для следующей вставки делаем
					lastRow = nr; // последняя уже вставлена
				}
			}
			return lastRow;
		}

		void CorrectCellAddresses(Row row)
		{
			foreach (var c in row.ChildElements)
			{
				var clch = c as Cell;
				clch.CellReference = clch.CellReference.ToString()[0] + row.RowIndex.ToString();
			}
		}
	}
}

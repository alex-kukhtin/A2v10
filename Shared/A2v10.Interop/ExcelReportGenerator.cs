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

namespace A2v10.Interop
{
	public class ExcelReportGenerator
	{
		private SheetData _sheetData;
		SharedStringTable _sharedStringTable;

		public void GenerateReport(IDataModel dataModel)
		{
			String path = null;
			using (var doc = SpreadsheetDocument.Open(path, isEditable:true))
			{
				var workSheetPart = doc.WorkbookPart.WorksheetParts.First<WorksheetPart>();
				_sharedStringTable = doc.WorkbookPart.SharedStringTablePart.SharedStringTable;
				PrepareSharedStringTable();
				var workSheet = workSheetPart.Worksheet;
				_sheetData = workSheet.GetFirstChild<SheetData>();

				var workBook = doc.WorkbookPart.Workbook;
				var defName = workBook.DefinedNames.FirstChild;
				doc.Close();
			}
		}

		void PrepareSharedStringTable()
		{
			foreach (var ssitem in _sharedStringTable.Elements<SharedStringItem>())
			{
				String str = ssitem.Text.Text;
			}
		}
	}
}

// Copyright © 2019 Alex Kukhtin. All rights reserved.

using System;
using System.Text.RegularExpressions;
using System.Xml;

namespace A2v10.Interop.ExportTo
{
	public class HtmlReader
	{
		ExSheet _sheet;

		public ExSheet ReadHtmlSheet(String html)
		{
			_sheet = new ExSheet();
			var doc = GetXmlFromHtml(html);
			var table = doc.FirstChild;
			if (table.Name != "table")
				throw new InteropException("Invalid element for Html2Excel");

			foreach (var n in table.ChildNodes)
			{
				var nd = n as XmlNode;
				switch (nd.Name)
				{
					case "colgroup":
						foreach (var x in nd.ChildNodes)
							AddColumn(x as XmlNode);
						break;
					case "tbody":
					case "thead":
					case "tfoot":
						var rowNo = 0;
						if (!Enum.TryParse<RowKind>(nd.Name, out RowKind kind))
							throw new InvalidOperationException();
						foreach (var x in nd.ChildNodes)
							AddRow(x as XmlNode, kind, rowNo++);
						break;
				}
			}
			return _sheet;
		}

		XmlDocument GetXmlFromHtml(String html)
		{
			var reg = new Regex("<col ([\\w=\"\\s:%;]+)>");
			var xml = reg.Replace(html, (math) => $"<col {math.Groups[1].Value} />");
			var doc = new XmlDocument();
			doc.LoadXml(xml);
			return doc;
		}

		void AddRow(XmlNode src, RowKind kind, Int32 rowNo)
		{
			ExRow row = _sheet.GetRow(rowNo, kind);
			var classAttr = src.Attributes["class"];
			if (classAttr != null)
				row.SetRoleAndStyle(classAttr.Value);
			foreach (var c in src.ChildNodes)
			{
				var cn = c as XmlNode;
				var colSpanAttr = cn.Attributes["colspan"];
				var rowSpanAttr = cn.Attributes["rowspan"];
				var span = new CellSpan();
				if (colSpanAttr != null)
					span.Col = Int32.Parse(colSpanAttr.Value);
				if (rowSpanAttr != null)
					span.Row = Int32.Parse(rowSpanAttr.Value);

				var dataTypeAttr = cn.Attributes["data-type"];
				String dataType = null;
				if (dataTypeAttr != null)
					dataType = dataTypeAttr.Value;
				var cellClassAttr = cn.Attributes["class"];
				String cellClass = null;
				if (cellClassAttr != null)
					cellClass = cellClassAttr.Value;

				_sheet.AddCell(rowNo, row, span, cn.InnerText, dataType, cellClass);
			}
		}

		void AddColumn(XmlNode src)
		{
			var classAttr = src.Attributes["class"];
			ExColumn  col = _sheet.AddColumn();
			if (classAttr != null)
			{

			}
		}
	}
}

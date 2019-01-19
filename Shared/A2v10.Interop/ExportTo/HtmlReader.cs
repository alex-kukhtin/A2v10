// Copyright © 2019 Alex Kukhtin. All rights reserved.

using System;
using System.Text.RegularExpressions;
using System.Xml;
using System.Linq;

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

			var bodyRowNo = 0;
			var headerRowNo = 0;
			var footerRowNo = 0;
			foreach (var n in table.ChildNodes)
			{
				var nd = n as XmlNode;
				if (nd.NodeType != XmlNodeType.Element)
					continue;
				switch (nd.Name)
				{
					case "colgroup":
						foreach (var col in nd.ChildNodes.OfType<XmlNode>().Where(node => node.Name == "col"))
							AddColumn(col);
						break;
					case "tbody":
						var bodyClassAttr = nd.Attributes["class"];
						if (bodyClassAttr?.Value == "col-shadow")
							continue; // skip shadows
						foreach (var row in nd.ChildNodes.OfType<XmlNode>().Where(node => node.Name == "tr"))
							AddRow(row, RowKind.Body, bodyRowNo++);
						break;
					case "thead":
						foreach (var row in nd.ChildNodes.OfType<XmlNode>().Where(node => node.Name == "tr"))
							AddRow(row, RowKind.Header, headerRowNo++);
						break;
					case "tfoot":
						foreach (var row in nd.ChildNodes.OfType<XmlNode>().Where(node => node.Name == "tr"))
							AddRow(row as XmlNode, RowKind.Footer, footerRowNo++);
						break;
				}
			}
			return _sheet;
		}

		XmlDocument GetXmlFromHtml(String html)
		{
			var reg = new Regex("<col ([\\w=\"\\s:%;-]+)>");
			var xml = reg.Replace(html, (math) => $"<col {math.Groups[1].Value} />")
				.Replace("&nbsp;", "&#160;");
			var doc = new XmlDocument();
			doc.LoadXml(xml);
			return doc;
		}

		String GetNodeText(XmlNode node)
		{
			if (!node.HasChildNodes)
				return node.InnerText;
			foreach (var ch in node.ChildNodes.OfType<XmlNode>().Where(n => n.NodeType == XmlNodeType.Element))
			{
				var classAttr = ch.Attributes["class"];
				if (classAttr != null && classAttr.Value.Contains("popover-wrapper"))
					return ch.FirstChild?.InnerText;
			}
			return node.InnerText;
		}

		void AddRow(XmlNode src, RowKind kind, Int32 rowNo)
		{
			ExRow row = _sheet.GetRow(rowNo, kind);
			var classAttr = src.Attributes["class"];
			if (classAttr != null)
				row.SetRoleAndStyle(classAttr.Value);
			var heightAttr = src.Attributes["data-row-height"];
			if (heightAttr != null)
			{
				if (UInt32.TryParse(heightAttr.Value, out UInt32 height))
					row.Height = height;
			}
			foreach (var cn in src.ChildNodes.OfType<XmlNode>().Where(node=> node.Name == "td"))
			{
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

				String cellText = GetNodeText(cn);
				_sheet.AddCell(rowNo, row, span, cellText, dataType, cellClass);
			}
		}

		void AddColumn(XmlNode src)
		{
			var classAttr = src.Attributes["class"];
			var widthAttr = src.Attributes["data-col-width"];
			ExColumn  col = _sheet.AddColumn();
			if (classAttr != null)
			{
				// fit, color
			}
			if (widthAttr != null)
			{
				if (UInt32.TryParse(widthAttr.Value, out UInt32 width))
					col.Width = width;
			}
		}
	}
}

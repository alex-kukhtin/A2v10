// Copyright © 2019 Alex Kukhtin. All rights reserved.

using System;
using System.Globalization;
using System.Text.RegularExpressions;

namespace A2v10.Interop.ExportTo
{
	public enum CellKind
	{
		Normal,
		Null,
		Span
	}

	public struct CellSpan
	{
		public Int32 Row;
		public Int32 Col;
	}

	public class ExCell
	{
		public CellSpan Span { get; set; }
		public String Value { get; set; }

		public CellKind Kind { get; set; }

		public DataType DataType { get; set; }
		public UInt32 StyleIndex { get; set; }

		String NormalizeNumber(String number)
		{
			if (number.IndexOf(".") != -1)
				return new Regex(@"[\s,]").Replace(number, String.Empty);
			else
				return new Regex(@"[\s]").Replace(number, String.Empty).Replace(",", ".");
		}

		String NormalizeDate(String text)
		{
			if (DateTime.TryParseExact(text, "dd.MM.yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime dt))
				return dt.ToOADate().ToString(CultureInfo.InvariantCulture);
			throw new InteropException($"Invalid date {text}");
		}

		String NormalizeDateTime(String text)
		{
			if (DateTime.TryParseExact(text, "dd.MM.yyyy HH:mm", CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime dt))
				return dt.ToOADate().ToString(CultureInfo.InvariantCulture);
			throw new InteropException($"Invalid datetime {text}");
		}

		public Style GetStyle(ExRow row, String strClasses)
		{
			var cls = Utils.ParseClasses(strClasses);
			var align = row.Align;
			if (cls.Align != HorizontalAlign.NotSet)
				align = cls.Align;
			return new Style()
			{
				DataType = DataType,
				RowRole = row.Role,
				RowKind = row.Kind,
				Align = align,
				Bold = cls.Bold
			};
		}

		public void SetValue(String text, String dataType)
		{
			switch (dataType)
			{
				case null:
				case "":
				case "string":
					DataType = DataType.String;
					Value = text;
					break;
				case "currency":
					DataType = DataType.Currency;
					Value = NormalizeNumber(text);
					break;
				case "number":
					DataType = DataType.Number;
					Value = NormalizeNumber(text);
					break;
				case "date":
					DataType = DataType.Date;
					Value = NormalizeDate(text);
					break;
				case "datetime":
					DataType = DataType.DateTime;
					Value = NormalizeDateTime(text);
					break;
				default:
					Value = text;
					break;
			}
		}

		public String Reference(Int32 row, Int32 col)
		{
			return $"{Index2Col(col)}{row + 1}";
		}

		String Index2Col(Int32 index)
		{
			Int32 q = index / 26;

			if (q > 0)
				return Index2Col(q - 1) + (Char)((Int32)'A' + (index % 26));
			else
				return "" + (Char)((Int32)'A' + index);
		}

		public String MergeReference(Int32 row, Int32 col)
		{
			if (Span.Col <= 1 && Span.Row <= 1)
				return null;
			var colDelta = Span.Col > 1 ? Span.Col - 1 : 0;
			var rowDelta = Span.Row > 1 ? Span.Row - 1 : 0;
			var rs = Span.Row - 1;
			return $"{Index2Col(col)}{row + 1}:{Index2Col(col + colDelta)}{row + 1 + rowDelta}";
		}
	}
}

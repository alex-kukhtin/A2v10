// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Globalization;
using System.Windows.Markup;

using A2v10.Infrastructure;

namespace A2v10.Xaml
{

	[TypeConverter(typeof(TableRowCollectionConverter))]
	public class TableRowCollection : List<TableRow>
	{
		internal void Render(RenderContext context)
		{
			foreach (var r in this)
				r.RenderElement(context);
		}
	}

	[ContentProperty("Cells")]
	public class TableRow : UIElement
	{
		public TableCellCollection Cells { get; set; } = new TableCellCollection();

		public Object Mark { get; set; }
		public VerticalAlign VAlign { get; set; }
		public TextAlign Align { get; set; }

		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var row = new TagBuilder("tr");
			onRender?.Invoke(row);
			MergeAttributes(row, context);

			var markBind = GetBinding(nameof(Mark));
			if (markBind != null)
			{
				if (GetBinding(nameof(Bold)) != null)
					throw new XamlException("The Bold and Mark bindings cannot be used at the same time");
				row.MergeAttribute(":class", markBind.GetPathFormat(context));
			}

			if (Align != TextAlign.Left)
				row.AddCssClass("text-" + Align.ToString().ToLowerInvariant());

			if (VAlign != VerticalAlign.Default)
				row.AddCssClass($"valign-{VAlign.ToString().ToLowerInvariant()}");

			row.RenderStart(context);
			RenderCells(context);
			row.RenderEnd(context);
		}

		void RenderCells(RenderContext context)
		{
			foreach (var c in Cells)
				c.RenderElement(context);
		}

		protected override void OnEndInit()
		{
			base.OnEndInit();
			TableCellCollection newCells = new TableCellCollection();
			foreach (var c in Cells)
			{
				if (c is TableCell || c is TableMarkCell)
					newCells.Add(c);
				else
					newCells.Add(new TableCell() { Content = c });
			}
			Cells = newCells;
			foreach (var c in Cells)
				c.SetParent(this);
		}

		internal override void OnSetStyles()
		{
			base.OnSetStyles();
			foreach (var c in Cells)
				c.OnSetStyles();
		}

		internal override void OnDispose()
		{
			base.OnDispose();
			foreach (var c in Cells)
				c.OnDispose();
		}
	}

	public class TableRowDivider : TableRow
	{
		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var table = (this.Parent as Table);
			var cols = Math.Max(table.Columns.Count, 1);
			var tr = new TagBuilder("tr").RenderStart(context);
			new TagBuilder("td", "row-divider").MergeAttribute("colspan", cols).Render(context);
			tr.RenderEnd(context);
		}
	}

	public class TableRowCollectionConverter : TypeConverter
	{
		public override Boolean CanConvertFrom(ITypeDescriptorContext context, Type sourceType)
		{
			if (sourceType == typeof(String))
				return true;
			return false;
		}

		public override Object ConvertFrom(ITypeDescriptorContext context, CultureInfo culture, Object value)
		{
			if (value == null)
				return null;
			if (value is String)
			{
				TableRowCollection trc = new TableRowCollection();
				TableRow row = new TableRow();
				trc.Add(row);
				foreach (var st in value.ToString().Split(','))
				{
					var s = st.Trim();
					var cell = new TableCell();
					if (s.EndsWith(":R"))
					{
						cell.Content = s.Substring(0, s.Length - 2);
						cell.Align = TextAlign.Right;
					}
					else if (s.EndsWith(":C"))
					{
						cell.Content = s.Substring(0, s.Length - 2);
						cell.Align = TextAlign.Center;
					}
					else if (s.EndsWith(":L"))
					{
						cell.Content = s.Substring(0, s.Length - 2);
						cell.Align = TextAlign.Left;
					}
					else
					{
						cell.Content = s;
					}
					row.Cells.Add(cell);
				}
				return trc;
			}
			throw new XamlException($"Invalid TableRowCollection value '{value}'");
		}
	}
}

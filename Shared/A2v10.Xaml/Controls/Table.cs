// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;
using A2v10.Infrastructure;

namespace A2v10.Xaml
{

	public enum TableBackgroundStyle
	{
		None,
		Paper,
		Yellow,
		Cyan,
		Rose,
		WhiteSmoke
	}

	public enum CellSpacingMode
	{
		None,
		Small,
		Medium,
		Large
	}


	[ContentProperty("Rows")]
	public class Table : Control, ITableControl
	{
		public GridLinesVisibility GridLines { get; set; }

		public TableRowCollection Rows { get; set; } = new TableRowCollection();

		public Boolean Border { get; set; }
		public Boolean Compact { get; set; }
		public Boolean Hover { get; set; }
		public Boolean Striped { get; set; }

		public TableBackgroundStyle Background { get; set; }
		public CellSpacingMode CellSpacing { get; set; }

		public TableRowCollection Header
		{
			get
			{
				if (_header == null)
					_header = new TableRowCollection();
				return _header;
			}
			set
			{
				_header = value;
			}
		}

		public TableRowCollection Footer
		{
			get
			{
				if (_footer == null)
					_footer = new TableRowCollection();
				return _footer;
			}
			set { _footer = value; }
		}

		public TableColumnCollection Columns
		{
			get
			{
				if (_columns == null)
					_columns = new TableColumnCollection();
				return _columns;
			}
			set
			{
				_columns = value;
			}
		}


		TableRowCollection _header;
		TableRowCollection _footer;
		TableColumnCollection _columns;

		public Object ItemsSource { get; set; }

		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var table = new TagBuilder("table", "a2-table", IsInGrid);
			onRender?.Invoke(table);
			MergeAttributes(table, context);
			if (Background != TableBackgroundStyle.None)
				table.AddCssClass("bk-" + Background.ToString().ToKebabCase());
			if (CellSpacing != CellSpacingMode.None)
			{
				table.AddCssClass("table-separate-border");
				table.AddCssClass("table-cell-spacing-" + CellSpacing.ToString().ToLowerInvariant());
			}
			if (GridLines != GridLinesVisibility.None)
				table.AddCssClass($"grid-{GridLines.ToString().ToLowerInvariant()}");

			table.AddCssClassBool(Border, "bordered");
			table.AddCssClassBool(Compact, "compact");
			table.AddCssClassBool(Hover, "hover");
			table.AddCssClassBool(Striped, "striped");

			Bind isBind = GetBinding(nameof(ItemsSource));
			if (isBind != null)
				table.MergeAttribute("v-lazy", isBind.GetPath(context));

			table.RenderStart(context);

			if (_columns != null)
				Columns.Render(context);

			RenderHeader(context);

			RenderBody(context);
			RenderFooter(context);

			table.RenderEnd(context);
		}

		void RenderHeader(RenderContext context)
		{
			if (_header == null)
				return;
			var thead = new TagBuilder("thead").RenderStart(context);
			foreach (var h in Header)
				h.RenderElement(context);
			thead.RenderEnd(context);
		}

		void RenderBody(RenderContext context)
		{
			if (Rows.Count == 0)
				return;
			var tbody = new TagBuilder("tbody").RenderStart(context);
			Bind isBind = GetBinding(nameof(ItemsSource));
			if (isBind != null)
			{
				var repeatAttr = $"(row, rowIndex) in {isBind.GetPath(context)}";
				using (new ScopeContext(context, "row", isBind.Path))
				{
					if (Rows.Count == 1)
					{
						Rows[0].RenderElement(context, (tag) =>
						{
							tag.MergeAttribute("v-for", repeatAttr);
						});
					}
					else
					{
						var tml = new TagBuilder("template");
						tml.MergeAttribute("v-for", repeatAttr);
						tml.RenderStart(context);
						using (var cts = new ScopeContext(context, "row", isBind.Path))
						{
							var rNo = 0;
							foreach (var row in Rows)
							{
								row.RenderElement(context, (tag) => tag.MergeAttribute(":key", $"'r{rNo}:' + rowIndex"));
								rNo += 1;
							}
						}
						tml.RenderEnd(context);
					}
				}
			}
			else
			{
				foreach (var row in Rows)
					row.RenderElement(context);
			}
			tbody.RenderEnd(context);
		}

		void RenderFooter(RenderContext context)
		{
			if (_footer == null)
				return;
			var tfoot = new TagBuilder("tfoot").RenderStart(context);
			foreach (var f in Footer)
				f.RenderElement(context);
			tfoot.RenderEnd(context);
		}

		protected override void OnEndInit()
		{
			base.OnEndInit();
			foreach (var c in Rows)
				c.SetParent(this);
			if (_header != null)
				foreach (var h in Header)
					h.SetParent(this);
			if (_footer != null)
				foreach (var f in Footer)
					f.SetParent(this);
			if (_columns != null)
				foreach (var c in Columns)
					c.SetParent(this);
		}

		public override void OnSetStyles()
		{
			base.OnSetStyles();
			foreach (var c in Rows)
				c.OnSetStyles();
			if (_header != null)
				foreach (var h in Header)
					h.OnSetStyles();
			if (_footer != null)
				foreach (var f in Footer)
					f.OnSetStyles();
			if (_columns != null)
				foreach (var c in Columns)
					c.OnSetStyles();
		}

		public override void OnDispose()
		{
			base.OnDispose();
			foreach (var c in Rows)
				c.OnDispose();
			if (_header != null)
				foreach (var h in Header)
					h.OnDispose();
			if (_footer != null)
				foreach (var f in Footer)
					f.OnDispose();
			if (_columns != null)
				foreach (var c in Columns)
					c.OnDispose();
		}
	}
}

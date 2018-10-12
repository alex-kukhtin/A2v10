// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;
using A2v10.Infrastructure;

namespace A2v10.Xaml
{
	public enum HeadersVisibility
	{
		Column,
		None
	}

	public enum RowDetailsActivate
	{
		ActiveRow,
		Cell
	}

	[ContentProperty("Columns")]
	public class DataGrid : Control
	{
		public Boolean Hover { get; set; }
		public Boolean Striped { get; set; }
		public Boolean Border { get; set; }
		public Boolean Sort { get; set; }
		public Boolean Compact { get; set; }

		public Boolean FixedHeader { get; set; }
		public HeadersVisibility HeadersVisibility { get; set; }

		public GridLinesVisibility GridLines { get; set; }

		public Object ItemsSource { get; set; }

		public DataGridColumnCollection Columns { get; set; } = new DataGridColumnCollection();

		public RowMarkerStyle MarkerStyle { get; set; }

		public MarkStyle Mark { get; set; }

		public Boolean? RowBold { get; set; }

		public Command DoubleClick { get; set; }

		public Length Height { get; set; }

		public DataGridRowDetails RowDetails { get; set; }

		GroupDescriptions _groupBy;
		public GroupDescriptions GroupBy
		{
			get
			{
				if (_groupBy == null)
					_groupBy = new GroupDescriptions();
				return _groupBy;
			}
			set { _groupBy = value; }
		}

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var dataGrid = new TagBuilder("data-grid", null, IsInGrid);
			onRender?.Invoke(dataGrid);
			MergeBindingAttributeBool(dataGrid, context, ":compact", nameof(Compact), Compact);
			MergeAttributes(dataGrid, context, MergeAttrMode.Margin | MergeAttrMode.Visibility);
			if (Height != null)
				dataGrid.MergeStyle("height", Height.Value);
			if (FixedHeader)
				dataGrid.MergeAttribute(":fixed-header", "true");
			if (HeadersVisibility == HeadersVisibility.None)
				dataGrid.MergeAttribute(":hide-header", "true");
			if (RowDetails != null)
			{
				dataGrid.MergeAttribute(":row-details", "true");
				dataGrid.MergeAttribute("row-details-activate", RowDetails.Activate.ToString().ToLowerInvariant());
				var vBind = RowDetails.GetBinding("Visible");
				if (vBind != null)
				{
					dataGrid.MergeAttribute("row-details-visible", vBind.Path /*!without context!*/);
				}
			}
			var isb = GetBinding(nameof(ItemsSource));
			if (isb != null)
				dataGrid.MergeAttribute(":items-source", isb.GetPath(context));
			MergeBoolAttribute(dataGrid, context, nameof(Hover), Hover);
			MergeBoolAttribute(dataGrid, context, nameof(Striped), Striped);
			MergeBoolAttribute(dataGrid, context, nameof(Border), Border);
			MergeBoolAttribute(dataGrid, context, nameof(Sort), Sort);
			dataGrid.MergeAttribute(":route-query", "$query"); // always!

			var dblClickBind = GetBindingCommand(nameof(DoubleClick));
			if (dblClickBind != null)
			{
				// Function!
				dataGrid.MergeAttribute(":doubleclick", "() => " + dblClickBind.GetCommand(context));
			}

			if (MarkerStyle != RowMarkerStyle.None)
				dataGrid.MergeAttribute("mark-style", MarkerStyle.ToString().ToKebabCase());

			var mbind = GetBinding(nameof(Mark));
			if (mbind != null)
			{
				dataGrid.MergeAttribute("mark", mbind.GetPath(context));
			}
			else if (Mark != MarkStyle.Default)
			{
				throw new XamlException("The Mark property must be a binding");
			}
			var rbbind = GetBinding(nameof(RowBold));

			if (rbbind != null)
				dataGrid.MergeAttribute("row-bold", rbbind.GetPath(context));
			else if (RowBold != null)
				throw new XamlException("The RowBold property must be a binding");

			// TODO: binding for GridLines ???
			if (GridLines != GridLinesVisibility.None)
				dataGrid.MergeAttribute("grid", GridLines.ToString());

			var groupByBind = GetBinding(nameof(GroupBy));
			if (groupByBind != null)
			{
				dataGrid.MergeAttribute(":group-by", groupByBind.GetPath(context));
			}
			else if (_groupBy != null)
			{
				dataGrid.MergeAttribute(":group-by", _groupBy.GetJsValue(context));
			}

			dataGrid.RenderStart(context);
			Int32 colIndex = 0;
			foreach (var col in Columns)
			{
				col.RenderColumn(context, colIndex);
				colIndex++;
			}
			RenderRowDetails(context);
			dataGrid.RenderEnd(context);
		}

		void RenderRowDetails(RenderContext context)
		{
			if (RowDetails == null)
				return;
			var rdtag = new TagBuilder("template");
			rdtag.MergeAttribute("slot", "row-details");
			rdtag.MergeAttribute("slot-scope", "details");
			rdtag.RenderStart(context);
			using (var ctx = new ScopeContext(context, "details.row"))
			{
				RowDetails.Content.RenderElement(context);
			}
			rdtag.RenderEnd(context);

		}

		protected override void OnEndInit()
		{
			base.OnEndInit();
			foreach (var col in Columns)
				col.SetParent(this);
		}
	}
}

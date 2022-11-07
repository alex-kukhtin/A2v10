// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

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
		Cell,
		Always
	}

	public enum DataGridStyle
	{
		Default,
		Light
	}

	[ContentProperty("Columns")]
	public class DataGrid : Control
	{
		public Boolean? Hover { get; set; }
		public Boolean? Striped { get; set; }
		public Boolean Border { get; set; }
		public Boolean Sort { get; set; }
		public Boolean Compact { get; set; }
		public DataGridStyle Style { get; set; }
		public BackgroundStyle Background { get; set; }

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

		public UIElement EmptyPanel { get; set; }
		public String EmptyPanelDelegate { get; set; }
		public AutoSelectMode AutoSelect { get; set; }

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

		public DropDownMenu ContextMenu { get; set; }

		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var dataGrid = new TagBuilder("data-grid", null, IsInGrid);
			onRender?.Invoke(dataGrid);
			MergeBindingAttributeBool(dataGrid, context, ":compact", nameof(Compact), Compact);
			MergeAttributes(dataGrid, context, MergeAttrMode.Margin | MergeAttrMode.Visibility);
			dataGrid.MergeAttribute("key", Guid.NewGuid().ToString()); // disable vue reusing

			String contextId = null;
			if (ContextMenu != null)
			{
				contextId = $"ctx-{Guid.NewGuid()}";
				dataGrid.MergeAttribute("v-contextmenu", $"'{contextId}'");
			}


			if (Height != null)
				dataGrid.MergeStyle("height", Height.Value);
			if (FixedHeader)
				dataGrid.MergeAttribute(":fixed-header", "true");
			if (HeadersVisibility == HeadersVisibility.None)
				dataGrid.MergeAttribute(":hide-header", "true");
			if (Style != DataGridStyle.Default)
				dataGrid.AddCssClass($"data-grid-{Style.ToString().ToKebabCase()}");

			if (Background != BackgroundStyle.Default)
				dataGrid.AddCssClass("background-" + Background.ToString().ToKebabCase());

			if (RowDetails != null)
			{
				dataGrid.MergeAttribute(":row-details", "true");
				dataGrid.MergeAttribute("row-details-activate", RowDetails.Activate.ToString().ToLowerInvariant());
				var vBind = RowDetails.GetBinding("Visible");
				if (vBind != null)
					dataGrid.MergeAttribute("row-details-visible", vBind.Path /*!without context!*/);
				else
					dataGrid.MergeAttribute(":row-details-visible", RowDetails.Visible.ToString().ToLowerInvariant());
			}
			var isb = GetBinding(nameof(ItemsSource));
			if (isb != null)
				dataGrid.MergeAttribute(":items-source", isb.GetPath(context));
			MergeBoolAttributeIfExists(dataGrid, context, nameof(Hover), Hover);
			MergeBoolAttributeIfExists(dataGrid, context, nameof(Striped), Striped);
			MergeBoolAttribute(dataGrid, context, nameof(Border), Border);
			MergeBoolAttribute(dataGrid, context, nameof(Sort), Sort);
			dataGrid.MergeAttribute(":route-query", "$query"); // always!
			if (!String.IsNullOrEmpty(EmptyPanelDelegate))
				dataGrid.MergeAttribute(":empty-panel-callback", $"$delegate('{EmptyPanelDelegate}')");


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
				dataGrid.MergeAttribute("mark", mbind.Path); // without context!!!
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

			if (AutoSelect != AutoSelectMode.None)
				dataGrid.MergeAttribute("auto-select", AutoSelect.ToString().ToKebabCase());

			dataGrid.RenderStart(context);
			Int32 colIndex = 0;
			foreach (var col in Columns)
			{
				col.RenderColumn(context, colIndex);
				colIndex++;
			}
			RenderRowDetails(context);
			RenderEmptyPanel(context);
			RenderFooter(context);
			RenderContextMenu(ContextMenu, context, contextId);
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
			using (var ctx = new ScopeContext(context, "details.row", null))
			{
				RowDetails.Content.RenderElement(context);
			}
			rdtag.RenderEnd(context);

		}

		void RenderEmptyPanel(RenderContext context)
		{
			if (EmptyPanel == null)
				return;
			var panel = new TagBuilder("template");
			panel.MergeAttribute("slot", "empty");
			panel.RenderStart(context);
			EmptyPanel.RenderElement(context);
			panel.RenderEnd(context);
		}

		void RenderFooter(RenderContext context)
		{
			/*TODO: do it!
			var templ = new TagBuilder("template");
			templ.MergeAttribute("slot", "footer");
			templ.RenderStart(context);
			var tfoot = new TagBuilder("tfoot");
			tfoot.RenderStart(context);
			context.Writer.Write("<tr><td colspan=\"3\">11</td><td>22</td><td>33</td></tr>");
			tfoot.RenderEnd(context);
			templ.RenderEnd(context);
			*/
		}

		protected override void OnEndInit()
		{
			base.OnEndInit();
			foreach (var col in Columns)
				col.SetParent(this);
		}

		public override void OnSetStyles(RootContainer root)
		{
			base.OnSetStyles(root);
			foreach (var col in Columns)
				col.OnSetStyles(root);
		}
	}
}

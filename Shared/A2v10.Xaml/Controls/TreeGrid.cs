// Copyright © 2015-2022 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;


namespace A2v10.Xaml;

public enum FolderStyle
{
	None,
	Bold,
	Italic
}

[ContentProperty("Cells")]
public class TreeGrid : Control, ITableControl
{
	public Boolean Hover { get; set; }
	public Boolean Striped { get; set; }
	public Boolean StickyHeaders { get; set; }
	public Length Height { get; set; }
	public GridLinesVisibility GridLines { get; set; }
	public FolderStyle FolderStyle { get; set; }
	public Object ItemsSource { get; set; }
	public String ItemsProperty { get; set; }

	public TreeGridCellCollection Cells { get; set; } = new TreeGridCellCollection();
	public TreeGridCellCollection Header { get; set; } = new TreeGridCellCollection();
	public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
	{
		if (SkipRender(context))
			return;

		if(StickyHeaders)
		{
			var outTag = new TagBuilder("div", "a2-sticky-container", IsInGrid);
			MergeAttributes(outTag, context, MergeAttrMode.Visibility);
			if (Height != null)
				outTag.MergeStyle("height", Height.Value);
			outTag.RenderStart(context);
			RenderGrid(context, "tree-grid sticky", false, false, null);
			outTag.RenderEnd(context);

			/*
			var sb = new TagBuilder("div", "a2-sticky-bottom");
			if (Width != null)
				sb.MergeStyle("width", Width.Value);
			sb.Render(context);
			*/
		}
		else
		{
			RenderGrid(context, "tree-grid", IsInGrid, true, onRender);
		}

	}

	private void RenderGrid(RenderContext context, String tblClass, Boolean inGrid, Boolean mergeAttrs, Action<TagBuilder> onRender)
	{
		var treeGrid = new TagBuilder("tree-grid", tblClass, IsInGrid);
		onRender?.Invoke(treeGrid);
		if (mergeAttrs)
			MergeAttributes(treeGrid, context);

		treeGrid.AddCssClassBool(Hover, "hover");
		treeGrid.AddCssClassBool(Striped, "striped");

		treeGrid.MergeAttribute("folder-style", FolderStyle.ToString().ToLowerInvariant());

		var rootBind = GetBinding(nameof(ItemsSource));
		if (rootBind != null)
			treeGrid.MergeAttribute(":root", rootBind.GetPath(context));

		treeGrid.MergeAttribute("item", ItemsProperty);
		treeGrid.RenderStart(context);
		var slot = new TagBuilder("template");
		slot.MergeAttribute("v-slot:row", "row");
		slot.RenderStart(context);
		using (new ScopeContext(context, "row.itm", rootBind.Path))
		{
			foreach (var cell in Cells)
			{
				cell.RenderCell("td", context, SetGridlines);
			}
		}
		slot.RenderEnd(context);
		if (Header.Count > 0)
		{
			var hdr = new TagBuilder("template");
			hdr.MergeAttribute("v-slot:header", "hrd");
			hdr.RenderStart(context);
			foreach (var cell in Header)
			{
				cell.RenderCell("th", context, SetGridlines);
			}
			hdr.RenderEnd(context);
		}
		treeGrid.RenderEnd(context);
	}

	private void SetGridlines(TagBuilder tag)
	{
		switch (GridLines)
		{
			case GridLinesVisibility.Vertical:
				tag.AddCssClass("gl-v");
				return;
			case GridLinesVisibility.Horizontal:
				tag.AddCssClass("gl-h");
				return;
			case GridLinesVisibility.Both:
				tag.AddCssClass("gl-h gl-v");
				return;
		}
	}
	protected override void OnEndInit()
	{
		base.OnEndInit();
		foreach (var col in Cells)
			col.SetParent(this);
	}

	public override void OnSetStyles()
	{
		base.OnSetStyles();
		foreach (var col in Cells)
			col.OnSetStyles();
	}
}

﻿// Copyright © 2015-2025 Oleksandr Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;

namespace A2v10.Xaml;

[ContentProperty("Cells")]
public class SheetCellGroup : XamlElement, ISheetCell
{
	public SheetCells Cells { get; } = new SheetCells();
	public Object ItemsSource { get; set; }
	public Boolean? If { get; set; }

	public void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
	{
		var isBind = GetBinding(nameof(ItemsSource));
		if (isBind != null)
		{
			var t = new TagBuilder("template");
			MergeBindingAttributeBool(t, context, "v-if", nameof(If), If);
			t.MergeAttribute("v-for", $"(cell, cellIndex) in {isBind.GetPath(context)}");
			t.RenderStart(context);
			using (new ScopeContext(context, "cell", isBind.Path))
			{
				RenderChildren(context);
			}
			t.RenderEnd(context);

		}
		else
		{
            var t = new TagBuilder("template");
            MergeBindingAttributeBool(t, context, "v-if", nameof(If), If);
            t.RenderStart(context);
            RenderChildren(context);
            t.RenderEnd(context);
        }
    }

	void RenderChildren(RenderContext context)
	{
		foreach (var c in Cells)
			c.RenderElement(context);
	}

	protected override void OnEndInit()
	{
		foreach (var c in Cells)
			c.SetParent(this);
	}

	public override void OnSetStyles(RootContainer root)
	{
		base.OnSetStyles(root);
		foreach (var c in Cells)
			c.OnSetStyles(root);
	}
}

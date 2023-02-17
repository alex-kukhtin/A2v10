// Copyright © 2022-2023 Oleksandr Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;

namespace A2v10.Xaml;

[ContentProperty("ItemTemplate")]
public class Dashboard : UIElementBase
{
	public Object ItemsSource { get; set; }
	public GridLength CellWidth { get; set; }
	public GridLength CellHeight { get; set; }
	public UIElement EndEditToolbar { get; set; }
	public Button StartEditButton { get; set; }
	public Boolean Editable { get; set; }
	public Boolean EditMode { get; set; }
	public Object ItemsList { get; set; }
	public UIElementBase ItemTemplate { get; set; }
	public UIElementBase ListTemplate { get; set; }
	public UIElement EmptyPanel { get; set; }
	public String CssClass { get; set; }
	public String GroupBy { get; set; }

	public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
	{
		if (SkipRender(context))
			return;
		var tag = new TagBuilder("a2-dashboard", null, IsInGrid);
		onRender?.Invoke(tag);
		MergeAttributes(tag, context);
		tag.AddCssClass(CssClass);
		var sourceBind = GetBinding(nameof(ItemsSource));
		if (sourceBind == null)
			throw new XamlException("ItemsSource binding is required for the Dashboard element");
		MergeBindingAttributeBool(tag, context, ":editable", nameof(Editable), Editable);
		MergeBindingAttributeBool(tag, context, ":edit-mode", nameof(EditMode), EditMode);
		tag.MergeAttribute("group-by", GroupBy);
		tag.MergeAttribute(":items", sourceBind.GetPath(context));
		if (CellWidth != null || CellHeight != null)
		{
			var cx = "Auto";
			var cy = "Auto";
			if (CellWidth != null)
				cx = CellWidth.Value;
			if (CellHeight != null)
				cy = CellHeight.Value;	
			tag.MergeAttribute(":cell-size", $"{{cx:'{cx}', cy:'{cy}'}}");
		}
		var listBind = GetBinding(nameof(ItemsList));
		if (listBind != null)
		{
			tag.MergeAttribute("v-lazy", listBind.GetPath(context));
			tag.MergeAttribute(":list", listBind.GetPath(context));
		}
		tag.RenderStart(context);
		if (ItemTemplate != null)
		{
			var templ = new TagBuilder("template");
			templ.MergeAttribute("v-slot:element", "elem");
			templ.RenderStart(context);
			using (var ctx = new ScopeContext(context, "elem.item", null))
			{
				ItemTemplate.RenderElement(context);
			}
			templ.RenderEnd(context);
		}
		if (ListTemplate != null)
		{
			var templ = new TagBuilder("template");
			templ.MergeAttribute("v-slot:listitem", "lelem");
			templ.RenderStart(context);
			using (var ctx = new ScopeContext(context, "lelem.item", null))
			{
				ListTemplate.RenderElement(context);
			}
			templ.RenderEnd(context);
		}
		if (StartEditButton != null)
		{
			var tb = new TagBuilder("template");
			tb.MergeAttribute("v-slot:startbtn", "btn");
			tb.RenderStart(context);
			StartEditButton.RenderElement(context, tag =>
			{
				tag.AddCssClass("btn-tb");
			});
			tb.RenderEnd(context);
		}
		if (EndEditToolbar != null)
		{
			var tb = new TagBuilder("template");
			tb.MergeAttribute("v-slot:toolbar", "tb");
			tb.RenderStart(context);
			EndEditToolbar.RenderElement(context);
			tb.RenderEnd(context);
		}
		if (EmptyPanel != null) 
		{ 
			var panel = new TagBuilder("template");
			panel.MergeAttribute("slot", "empty");
			panel.RenderStart(context);
			EmptyPanel.RenderElement(context);
			panel.RenderEnd(context);
		}
	}
}


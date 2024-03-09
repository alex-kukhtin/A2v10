// Copyright © 2015-2024 Oleksandr Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Windows.Markup;

namespace A2v10.Xaml;

[ContentProperty("Content")]
public class ColorComboBoxItem : UIElementBase
{
	public String Content { get; set; }
	public Object Value { get; set; }
	public String Color { get; set; }
	public Boolean Outline { get; set; }
	public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
	{
		throw new XamlException("Only bindings are supported");
	}
}

public class ColorComboBoxItems : List<ColorComboBoxItem>
{

}

[ContentProperty("Children")]
public class ColorComboBox : ValuedControl, ITableControl
{
	public Object ItemsSource { get; set; }
	public TextAlign Align { get; set; }
	public Boolean DropUp { get; set; }

	ColorComboBoxItems _children;

	public ColorComboBoxItems Children
	{
		get
		{
			_children ??= new ColorComboBoxItems();
			return _children;
		}
		set
		{
			_children = value;
		}
	}

	public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
	{
		if (CheckDisabledModel(context))
			return;
		var combo = new TagBuilder("a2-color-combobox", null, IsInGrid);
		onRender?.Invoke(combo);
		combo.MergeAttribute("v-cloak", String.Empty);
		MergeAttributes(combo, context);
		MergeAlign(combo, context, Align);
		if (DropUp)
			combo.AddCssClass("drop-up");
		SetSize(combo, nameof(ColorComboBox));
		MergeDisabled(combo, context);
		var isBind = GetBinding(nameof(ItemsSource));
		if (isBind != null)
		{
			combo.MergeAttribute(":items-source", isBind.GetPath(context));
			if (_children != null)
			{
				if (Children.Count != 1)
				{
					throw new XamlException("The ColorComboBox with the specified ItemsSource must have only one ColorComboBoxItem element");
				}
				var elem = Children[0];
				var contBind = elem.GetBinding("Content")
					?? throw new XamlException("ColorComboBoxItem. Content binging must be specified");
				combo.MergeAttribute(":name-prop", $"'{contBind.Path}'"); /*without context!*/
				var valBind = elem.GetBinding("Value")
					?? throw new XamlException("ColorComboBoxItem. Value binging must be specified");
				combo.MergeAttribute(":value-prop", $"'{valBind.Path}'");  /*without context!*/
				var colorBind = elem.GetBinding("Color")
					?? throw new XamlException("ColorComboBoxItem. Color binging must be specified");
				if (colorBind != null)
					combo.MergeAttribute(":color-prop", $"'{colorBind.Path}'"); /*without context!*/
				if (elem.Outline)
					combo.MergeAttribute(":outline", "true");
			}
		}
		MergeValue(combo, context);
		combo.RenderStart(context);
		RenderPopover(context);
		RenderHint(context);
		RenderLink(context);
		combo.RenderEnd(context);
	}

	protected override void OnEndInit()
	{
		base.OnEndInit();
		if (_children != null)
			foreach (var ch in Children)
				ch.SetParent(this);
	}

	public override void OnSetStyles(RootContainer root)
	{
		base.OnSetStyles(root);
		if (_children != null)
			foreach (var ch in Children)
				ch.OnSetStyles(root);
	}
}

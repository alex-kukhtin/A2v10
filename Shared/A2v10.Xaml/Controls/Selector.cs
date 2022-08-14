// Copyright © 2015-2022 Alex Kukhtin. All rights reserved.

using System;
using A2v10.Infrastructure;

namespace A2v10.Xaml;

public enum SelectorStyle
{
	Default,
	ComboBox,
	Hyperlink
}


public class Selector : ValuedControl, ITableControl
{
	public TextAlign Align { get; set; }
	public String Delegate { get; set; }
	public String SetDelegate { get; set; }
	public String Fetch { get; set; }
	public String FetchData { get; set; }
	public String DisplayProperty { get; set; }
	public String Placeholder { get; set; }

	public Size ListSize { get; set; }
	public UIElementBase NewPane { get; set; }
	public Command CreateNewCommand { get; set; }

	public Object TextValue { get; set; }

	public Object ItemsSource { get; set; }
	public UIElementBase ItemsPanel { get; set; }
	public DropDownPlacement PanelPlacement { get; set; }

	public Boolean? ShowCaret { get; set; }
	public Boolean ShowClear { get; set; }

	public SelectorStyle Style { get; set; }

	public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
	{
		if (CheckDisabledModel(context))
			return;
		var input = new TagBuilder("a2-selector", null, IsInGrid);
		onRender?.Invoke(input);
		if (!String.IsNullOrEmpty(Delegate))
			input.MergeAttribute(":fetch", $"$delegate('{Delegate}')");
		if (!String.IsNullOrEmpty(Fetch))
			input.MergeAttribute("fetch-command", Fetch);
		if (!String.IsNullOrEmpty(SetDelegate))
			input.MergeAttribute(":hitfunc", $"$delegate('{SetDelegate}')");
		input.MergeAttribute("display", DisplayProperty);
		if (PanelPlacement != DropDownPlacement.BottomLeft)
			input.MergeAttribute("placement", PanelPlacement.ToString().ToKebabCase());
		if (Style != SelectorStyle.Default)
			input.MergeAttribute("mode", Style.ToString().ToKebabCase());
		SetSize(input, nameof(Selector));
		if (ListSize != null)
		{
			if (!ListSize.Width.IsEmpty)
				input.MergeAttribute("list-width", ListSize.Width.ToString());
			if (!ListSize.Height.IsEmpty)
			{
				input.MergeAttribute("list-height", ListSize.Height.ToString());
			}
		}
		if (ShowCaret.HasValue && ShowCaret.Value)
			input.MergeAttribute(":caret", "true");
		if (ShowClear)
			input.MergeAttribute(":has-clear", "true");

		var isBind = GetBinding(nameof(ItemsSource));
		if (isBind != null)
			input.MergeAttribute(":items-source", isBind.GetPath(context));

		var fetchData = GetBinding(nameof(FetchData));
		if (fetchData != null)
			input.MergeAttribute(":fetch-command-data", fetchData.GetPath(context));

		MergeAttributes(input, context);
		MergeDisabled(input, context);
		MergeAlign(input, context, Align);
		MergeBindingAttributeString(input, context, "placeholder", nameof(Placeholder), Placeholder);
		MergeValue(input, context);
		MergeCustomValueItemProp(input, context, nameof(TextValue), "text");
		MergeCreateNew(input, context);

		input.RenderStart(context);
		RenderAddOns(context);
		//RenderNewPane(context);
		RenderPaneTemplate(context);
		input.RenderEnd(context);
	}

	void MergeCreateNew(TagBuilder tag, RenderContext context)
	{
		var cmd = GetBindingCommand(nameof(CreateNewCommand));
		if (cmd == null)
			return;
		tag.MergeAttribute(":create-new", "(currentText) => " + cmd.GetCommand(context, false, "currentText"));
	}

	void RenderNewPane(RenderContext context)
	{
		if (NewPane == null)
			return;
		var npTag = new TagBuilder("template");
		npTag.MergeAttribute("slot", "new-pane");
		npTag.MergeAttribute("slot-scope", "newNane");
		npTag.RenderStart(context);
		using (var ctx = new ScopeContext(context, "newPane.elem", null))
		{
			NewPane.RenderElement(context);
		}
		npTag.RenderEnd(context);
	}

	void RenderPaneTemplate(RenderContext context)
	{
		if (ItemsPanel == null)
			return;
		if (!(ItemsPanel is DataGrid dg))
			throw new XamlException("Only DataGrid panel is supported");
		var tml = new TagBuilder("template");
		tml.MergeAttribute("slot", "pane");
		tml.MergeAttribute("slot-scope", "root");
		tml.RenderStart(context);
		using (var ctx = new ScopeContext(context, "itm", null))
		{
			ItemsPanel.RenderElement(context, (tag) =>
			{
				tag.MergeAttribute(":is-item-active", "root.isItemActive");
				tag.MergeAttribute(":hit-item", "root.hit");
				tag.MergeAttribute(":items-source", "root.items");
				if (ListSize != null && !ListSize.Height.IsEmpty && dg.FixedHeader)
				{
					// for fixed headers only
					tag.MergeStyle("height", ListSize.Height.ToString());
					tag.MergeStyle("max-height", ListSize.Height.ToString());
				}
			});
		}
		tml.RenderEnd(context);
	}

	protected override void OnEndInit()
	{
		base.OnEndInit();
		if (Style == SelectorStyle.ComboBox && !ShowCaret.HasValue)
			ShowCaret = true;
		ItemsPanel?.SetParent(this);
	}

	public override void OnSetStyles()
	{
		base.OnSetStyles();
		ItemsPanel?.OnSetStyles();
	}

	public override void OnDispose()
	{
		base.OnDispose();
		ItemsPanel?.OnDispose();
	}
}

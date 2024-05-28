// Copyright © 2015-2023 Oleksandr Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml;

public class TagsControl : ValuedControl, ITableControl
{
	public String SettingsDelegate { get; set; }
	public String Placeholder { get; set; }
	public Object ItemsSource { get; set; }

	public String NameProperty { get; set; }
	public String ColorProperty { get; set; }

	public String SettingsText { get; set; }

	public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
	{
		if (CheckDisabledModel(context))
			return;
		var input = new TagBuilder("a2-tags", null, IsInGrid);
		onRender?.Invoke(input);
		input.MergeAttribute("content-prop", NameProperty);
		input.MergeAttribute("color-prop", ColorProperty);
		input.MergeAttribute("settings-text", context.Localize(SettingsText));
		if (!String.IsNullOrEmpty(SettingsDelegate))
			input.MergeAttribute(":settings-func", $"$delegate('{SettingsDelegate}')");

		var isBind = GetBinding(nameof(ItemsSource));
		if (isBind != null)
			input.MergeAttribute(":items-source", isBind.GetPath(context));

		MergeAttributes(input, context);
		MergeDisabled(input, context);
		MergeBindingAttributeString(input, context, "placeholder", nameof(Placeholder), Placeholder);
		MergeValue(input, context);

		input.RenderStart(context);
		RenderAddOns(context);
		input.RenderEnd(context);
	}
}

public class TagsFilter : ValuedControl, ITableControl
{
	public String Placeholder { get; set; }
	public Object ItemsSource { get; set; }

	public String NameProperty { get; set; }
	public String ColorProperty { get; set; }
	public Boolean OpenTop { get; set; }

	public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
	{
		if (CheckDisabledModel(context))
			return;
		var input = new TagBuilder("a2-tags-filter", null, IsInGrid);
		onRender?.Invoke(input);
		input.MergeAttribute("content-prop", NameProperty);
		input.MergeAttribute("color-prop", ColorProperty);
		input.AddCssClassBool(OpenTop, "open-top");

		var isBind = GetBinding(nameof(ItemsSource));
		if (isBind != null)
			input.MergeAttribute(":items-source", isBind.GetPath(context));

		MergeAttributes(input, context);
		MergeDisabled(input, context);
		MergeBindingAttributeString(input, context, "placeholder", nameof(Placeholder), Placeholder);
		MergeValue(input, context);

		input.RenderStart(context);
		RenderAddOns(context);
		input.RenderEnd(context);
	}
}

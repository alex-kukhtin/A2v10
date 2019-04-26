// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Windows.Markup;

namespace A2v10.Xaml
{
	[ContentProperty("Content")]
	public class ComboBoxItem : UIElementBase
	{
		public String Content { get; set; }
		public Object Value { get; set; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var option = new TagBuilder("option");
			MergeAttributes(option, context, MergeAttrMode.Visibility);
			if (Value != null)
			{
				if (Value is IJavaScriptSource)
				{
					var jsValue = (Value as IJavaScriptSource).GetJsValue(context);
					option.MergeAttribute(":value", jsValue);
				}
				else
					option.MergeAttribute("value", Value.ToString());
			}
			else
			{
				option.MergeAttribute(":value", "null"); // JS null value
			}
			option.RenderStart(context);
			if (Content != null)
				context.Writer.Write(context.Localize(Content));
			option.RenderEnd(context);
		}
	}

	public class ComboBoxItems : List<ComboBoxItem>
	{

	}

	public enum ComboBoxStyle
	{
		Default,
		Hyperlink
	}

	[ContentProperty("Children")]
	public class ComboBox : ValuedControl, ITableControl
	{
		public Object ItemsSource { get; set; }
		public String DisplayProperty { get; set; }
		public Boolean ShowValue { get; set; }
		public TextAlign Align { get; set; }
		public ComboBoxStyle Style { get; set; }
		public ControlSize Size { get; set; }

		ComboBoxItems _children;

		public ComboBoxItems Children
		{
			get
			{
				if (_children == null)
					_children = new ComboBoxItems();
				return _children;
			}
			set
			{
				_children = value;
			}
		}

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (CheckDisabledModel(context))
				return;
			var combo = new TagBuilder("select", null, IsInGrid);
			onRender?.Invoke(combo);
			combo.MergeAttribute("is", "combobox");
			combo.MergeAttribute("v-cloak", String.Empty);
			combo.MergeAttribute("display", DisplayProperty);
			if (Style != ComboBoxStyle.Default)
				combo.AddCssClass($"combo-{Style.ToString().ToLowerInvariant()}");
			MergeAttributes(combo, context);
			MergeAlign(combo, context, Align);
			MergeBoolAttribute(combo, context, nameof(ShowValue), ShowValue);
			if (Size != ControlSize.Default)
				combo.AddCssClass($"cb-{Size.ToString().ToLowerInvariant()}");
			MergeDisabled(combo, context);
			var isBind = GetBinding(nameof(ItemsSource));
			if (isBind != null)
			{
				combo.MergeAttribute(":items-source", isBind.GetPath(context));
				if (_children != null)
				{
					if (Children.Count != 1)
					{
						throw new XamlException("The ComboBox with the specified ItemsSource must have only one ComboBoxItem element");
					}
					var elem = Children[0];
					var contBind = elem.GetBinding("Content");
					if (contBind == null)
						throw new XamlException("ComboBoxItem. Content binging must be specified");
					combo.MergeAttribute(":name-prop", $"'{contBind.Path}'"); /*without context!*/
					var valBind = elem.GetBinding("Value");
					if (valBind == null)
						throw new XamlException("ComboBoxItem. Value binging must be specified");
					combo.MergeAttribute(":value-prop", $"'{valBind.Path}'");  /*without context!*/
				}
			}
			MergeValue(combo, context);
			combo.RenderStart(context);
			if (_children != null && isBind == null)
			{
				foreach (var ch in Children)
					ch.RenderElement(context);
			}
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

		internal override void OnSetStyles()
		{
			base.OnSetStyles();
			if (_children != null)
				foreach (var ch in Children)
					ch.OnSetStyles();
		}
	}
}

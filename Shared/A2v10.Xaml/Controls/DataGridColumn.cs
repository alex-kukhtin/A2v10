// Copyright © 2015-2023 Oleksandr Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Windows.Markup;
using A2v10.Infrastructure;

namespace A2v10.Xaml;

public enum ColumnControlType
{
	Default,
	Editor,
	CheckBox,
	Validator
}

public enum ColumnRole
{
	Default,
	Id,
	Number,
	Date
}

[ContentProperty("Content")]
public class DataGridColumn : XamlElement
{
	public Object Content { get; set; }
	//TODO: may be UIElement
	public String Header { get; set; }
	public TextAlign Align { get; set; }
	public Boolean Fit { get; set; }
	public Boolean Editable { get; set; }
	public Command Command { get; set; }
	public ColumnControlType ControlType { get; set; }
	public Object Mark { get; set; }
	public Length Width { get; set; }
	public Icon Icon { get; set; }
	public WrapMode Wrap { get; set; }
	public Boolean? Sort { get; set; }
	public String SortProperty { get; set; }
	public Boolean? Small { get; set; }
	public Boolean? Bold { get; set; }
	public Boolean? If { get; set; }
	public ColumnRole Role { get; set; }

	public Int32 MaxChars { get; set; }

	Boolean _noPadding;

	internal void RenderColumn(RenderContext context, Int32 colIndex)
	{
		CheckValid();
		var column = new TagBuilder("data-grid-column");

		SetColumnRole(column);

		MergeBindingAttribute(context, column, "header", nameof(Header), Header);

		MergeBindingAttributeBool(column, context, "v-if", nameof(If), If);

		MergeBoolAttribute(column, context, nameof(Editable), Editable);
		if (_noPadding)
			column.MergeAttribute(":no-padding", "true");
		if (Sort != null)
			column.MergeAttribute(":sort", Sort.Value.ToString().ToLowerInvariant());
		if (SortProperty != null)
			column.MergeAttribute("sort-prop", SortProperty);
		if (Small != null)
			column.MergeAttribute(":small", Small.Value.ToString().ToLowerInvariant());

		if (MaxChars != 0)
			column.MergeAttribute(":max-chars", MaxChars);

		var boldBind = GetBinding(nameof(Bold));
		if (boldBind != null)
			column.MergeAttribute("bold", $"{{{boldBind.GetPath(context)}}}");
		else if (Bold != null)
			column.MergeAttribute("bold", Bold.Value.ToString().ToLowerInvariant());

		MergeBoolAttribute(column, context, nameof(Fit), Fit);
		if (Width != null)
			column.MergeAttribute("width", Width.Value);
		var iconBind = GetBinding(nameof(Icon));
		if (iconBind != null)
			column.MergeAttribute("bind-icon", iconBind.Path /*without context*/);
		else if (Icon != Icon.NoIcon)
			column.MergeAttribute("icon", Icon.ToString().ToKebabCase());
		if (Wrap != WrapMode.Default)
			column.MergeAttribute("wrap", Wrap.ToString().ToKebabCase(), true);

		var markBind = GetBinding(nameof(Mark));
		if (markBind != null)
			column.MergeAttribute("mark", markBind.Path /*!without context!*/);
		else if (Mark != null)
			throw new XamlException("The Mark property must be a binding");

		CreateEditable();

		Boolean isTemplate = Content is UIElementBase;
		String tmlId = null;
		if (!isTemplate)
		{
			// always content without a SEMICOLON!
			var bindProp = GetBinding(nameof(Content));
			if (bindProp != null)
			{
				column.MergeAttribute("content", bindProp.Path /*!without context!*/);
				if (bindProp.DataType != DataType.String)
					column.MergeAttribute("data-type", bindProp.DataType.ToString());
				if (bindProp.HideZeros)
					column.MergeAttribute(":hide-zeros", "true");
				if (!String.IsNullOrEmpty(bindProp.Format))
					column.MergeAttribute("format", bindProp.Format);
			}
			else if (Content != null)
				throw new XamlException($"The Content property must be a binding ({Content})");
		}

		Bind ctBind = GetBinding(nameof(ControlType));
		if (ctBind != null)
			column.MergeAttribute(":control-type", ctBind.Path /*!without context!*/);
		else if (ControlType != ColumnControlType.Default)
			column.MergeAttribute("control-type", ControlType.ToString().ToLowerInvariant());

		var alignProp = GetBinding(nameof(Align));
		if (alignProp != null)
			column.MergeAttribute(":align", alignProp.Path /*!without context!*/, true);
		else if (Align != TextAlign.Default)
			column.MergeAttribute("align", Align.ToString().ToLowerInvariant(), true);

		if (isTemplate)
		{
			tmlId = $"col{colIndex}";
			column.MergeAttribute("id", tmlId);
		}

		var cmdBind = GetBindingCommand(nameof(Command));
		if (cmdBind != null)
			column.MergeAttribute(":command", cmdBind.GetCommand(context, indirect:true));
		column.RenderStart(context);
		column.RenderEnd(context);
		if (isTemplate)
		{
			var templ = new TagBuilder("template");
			templ.MergeAttribute("slot", tmlId);
			templ.MergeAttribute("slot-scope", "cell");
			templ.RenderStart(context);
			using (var ctx = new ScopeContext(context, "cell.row", null))
			{
				(Content as UIElementBase).RenderElement(context);

			}
			templ.RenderEnd(context);
		}
	}

	void MergeBindingAttribute(RenderContext context, TagBuilder tag, String attr, String propName, Object propValue)
	{
		var bindProp = GetBinding(propName);
		if (bindProp != null)
			tag.MergeAttribute(":" + attr, bindProp.GetPath(context));
		else if (propValue != null)
			tag.MergeAttribute(attr, context.Localize(propValue.ToString()));
	}

	void SetColumnRole(TagBuilder column)
	{
		if (Role == ColumnRole.Default)
			return;
		switch (Role)
		{
			case ColumnRole.Id:
			case ColumnRole.Number:
				// fit, nowrap, right
				column.MergeAttribute(":fit", "true", true);
				column.MergeAttribute("wrap", "no-wrap", true);
				column.MergeAttribute("align", "right", true);
				break;
			case ColumnRole.Date:
				column.MergeAttribute(":fit", "true", true);
				column.MergeAttribute("wrap", "no-wrap", true);
				column.MergeAttribute("align", "center", true);
				break;
		}
	}

	void CreateEditable()
	{
		switch (ControlType)
		{
			case ColumnControlType.Default:
			case ColumnControlType.Editor:
				if (!Editable)
					return;
				var textBox = new TextBox();
				textBox.SetBinding("Value", GetBinding("Content"));
				textBox.SetBinding("Align", GetBinding("Align")); // dynamic
				textBox.Align = Align; // static
				Content = textBox;
				break;
			case ColumnControlType.CheckBox:
				var checkBox = new CheckBox();
				checkBox.SetBinding("Value", GetBinding("Content"));
				if (!Editable)
					checkBox.Disabled = true;
				Content = checkBox;
				break;
		}
	}

	void CheckValid()
	{
		if (Editable && Content != null)
		{
			throw new XamlException("For editable columns the Content must be a binding");
		}
		if (Content is ValuedControl)
		{
			_noPadding = true;
		}
	}

	protected override void OnEndInit()
	{
		base.OnEndInit();
		if (Content is XamlElement xamlElement)
			xamlElement.SetParent(this);
	}

	public override void OnSetStyles(RootContainer root)
	{
		base.OnSetStyles(root);
		if (Content is XamlElement xamlElement)
			xamlElement.OnSetStyles(root);
	}
}

public class DataGridColumnCollection : List<DataGridColumn>
{
	public DataGridColumnCollection()
	{

	}
}

// Copyright © 2015-2023 Oleksandr Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Windows.Markup;

namespace A2v10.Xaml;

public class PropertyGridItems : List<PropertyGridItem>
{
	internal void Render(RenderContext context)
	{
		foreach (var itm in this)
			itm.RenderElement(context);
	}
}

[ContentProperty("Content")]
public class PropertyGridItem : UIElementBase
{
	public String Name { get; set; }
	public Object Content { get; set; }

	public Boolean? Bold { get; set; }

	public Boolean HideEmpty { get; set; }
    public UInt32 NameMaxChars { get; set; }
	public UInt32 ValueMaxChars { get; set; }

	public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
	{
		if (SkipRender(context))
			return;

		if (Parent is PropertyGrid propertyGrid)
		{
			if (NameMaxChars == 0)
				NameMaxChars = propertyGrid.NameMaxChars;
			if (ValueMaxChars == 0)
				ValueMaxChars = propertyGrid.ValueMaxChars;
		}

		var contBind = GetBinding(nameof(Content));

		var tr = new TagBuilder("tr");
		onRender?.Invoke(tr);
		MergeAttributes(tr, context);

		if (HideEmpty && GetBinding(nameof(If)) == null &&  contBind != null)
		{
			tr.MergeAttribute("v-if", contBind.GetPathFormat(context));
		}

		tr.RenderStart(context);

		var nameCell = new TagBuilder("td", "prop-name");
		var nameBind = GetBinding(nameof(Name));
		if (nameBind != null)
		{
			if (NameMaxChars > 0)
			{
				nameCell.MergeAttribute("v-text", $"$maxChars({contBind.GetPathFormat(context)}, {NameMaxChars})");
				nameCell.MergeAttribute(":title", contBind.GetPathFormat(context));
			}
			else
				nameCell.MergeAttribute("v-text", nameBind.GetPathFormat(context));
		}
		nameCell.RenderStart(context);
		if (!String.IsNullOrEmpty(Name))
			context.Writer.Write(context.LocalizeCheckApostrophe(Name));
		nameCell.RenderEnd(context);

		var valCell = new TagBuilder("td", "prop-value");
		valCell.AddCssClassBoolNo(Bold, "bold");
		if (contBind != null)
		{
			if (ValueMaxChars > 0)
			{
                valCell.MergeAttribute("v-text", $"$maxChars({contBind.GetPathFormat(context)}, {ValueMaxChars})");
				valCell.MergeAttribute(":title", contBind.GetPathFormat(context));
            } else 
				valCell.MergeAttribute("v-text", contBind.GetPathFormat(context));
			if (contBind.NegativeRed)
				valCell.MergeAttribute(":class", $"$getNegativeRedClass({contBind.GetPath(context)})");
		}

		valCell.RenderStart(context);
		if (Content is UIElementBase)
			(Content as UIElementBase).RenderElement(context);
		else if (Content != null)
			context.Writer.Write(context.LocalizeCheckApostrophe(Content.ToString()));
		valCell.RenderEnd(context);

		tr.RenderEnd(context);
	}

    protected override void OnEndInit()
    {
        base.OnEndInit();
    }
}

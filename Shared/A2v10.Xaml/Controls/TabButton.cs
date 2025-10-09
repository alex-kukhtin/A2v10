// Copyright © 2025 Oleksandr Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Windows.Markup;

namespace A2v10.Xaml;

public class TabButtonCollection : List<TabButton>
{

}

[ContentProperty("Content")]
public class TabButton : UIElementBase
{
	public Object Content { get; set; }
	public Object Description { get; set; }
	public String ActiveValue { get; set; }
    public String Badge { get; set; }

    public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
	{
		throw new NotImplementedException(nameof(RenderElement));
	}

	private String GetActiveValueArg(RenderContext context)
	{
		var activeValueArg = $"'{ActiveValue}'";
		var avBind = GetBinding(nameof(ActiveValue));
		if (avBind != null)
			activeValueArg = avBind.GetPathFormat(context);
		return activeValueArg;
	}

	public String GetClassForParent(RenderContext context, String valuePath)
	{
		var activeValueArg = GetActiveValueArg(context);
		return $"{{'active': {activeValueArg} == {valuePath}}}";
	}

	internal void RenderMe(RenderContext context, String valuePath)
	{
		if (SkipRender(context))
			return;

		var btn = new TagBuilder("a", "a2-tab-button");

		var activeValueArg = GetActiveValueArg(context);

		MergeAttributes(btn, context);
		if (valuePath != null)
		{
			btn.MergeAttribute(":class", $"{{'active': {activeValueArg} == {valuePath}}}");
			btn.MergeAttribute("@click.stop.prevent", $"$closeAllPopups(); {valuePath}={activeValueArg}");
		}

		btn.RenderStart(context);
		RenderContent(context);
        RenderBadge(context, Badge);
        RenderDescription(context);
		btn.RenderEnd(context);
	}

	void RenderContent(RenderContext context)
	{
		var span = new TagBuilder("span", "content");
		var cntBind = GetBinding(nameof(Content));
		if (cntBind != null)
			span.MergeAttribute("v-text", cntBind.GetPathFormat(context));
		span.RenderStart(context);
		if (Content is UIElementBase contUi)
			contUi.RenderElement(context);
		else if (Content != null)
			context.Writer.Write(context.LocalizeCheckApostrophe(Content.ToString()));
		span.RenderEnd(context);
	}

	void RenderDescription(RenderContext context)
	{
		var descBind = GetBinding(nameof(Description));
		if (descBind == null && Description == null)
			return;
		var span = new TagBuilder("span", "description");
		if (descBind != null)
			span.MergeAttribute("v-text", descBind.GetPathFormat(context));
		span.RenderStart(context);
		if (Description is UIElementBase descUi)
			descUi.RenderElement(context);
		else if (Description != null)
			context.Writer.Write(context.LocalizeCheckApostrophe(Description.ToString()));
		span.RenderEnd(context);
	}
}

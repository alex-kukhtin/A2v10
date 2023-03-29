// Copyright © 2023 Oleksandr Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;

namespace A2v10.Xaml;

public class HtmlAttribute : XamlElement
{
	public string Name { get; set; }
	public Object Value { get; set; }
}

public class HtmlAttributeCollection : List<HtmlAttribute>
{
}

public class HtmlElement : UIElementBase
{
	public HtmlAttributeCollection Attributes { get; set; } = new HtmlAttributeCollection();
	public String TagName { get; set; }	
	public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
	{
		var tag = new TagBuilder(TagName, null, IsInGrid);
		MergeAttributes(tag, context);
		foreach (var attr in Attributes)
		{
			var valBind = attr.GetBinding("Value");
			if (valBind != null)
				tag.MergeAttribute($":{attr.Name}", valBind.GetPathFormat(context));
			else if (attr.Value != null)
				tag.MergeAttribute(attr.Name, attr.Value.ToString());
		}
		tag.RenderStart(context);
		tag.RenderEnd(context);
	}
}

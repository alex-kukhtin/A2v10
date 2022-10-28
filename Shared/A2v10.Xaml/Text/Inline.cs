// Copyright © 2015-2022 Alex Kukhtin. All rights reserved.


using System;

using A2v10.Infrastructure;

namespace A2v10.Xaml;

public abstract class Inline : UIElement
{
	public Boolean? Block { get; set; }
	public TextColor Color { get; set; }
	public FloatMode Float { get; set; }

	internal Boolean IsNoBlock => Block.HasValue && !Block.Value;
	internal Boolean IsBlock => Block.HasValue && Block.Value;
	public override void MergeAttributes(TagBuilder tag, RenderContext context, MergeAttrMode mode = MergeAttrMode.All)
	{
		base.MergeAttributes(tag, context, mode);
		tag.AddCssClassBool(Block, "block");
		MergeOtherAttributes(tag, context);
	}

	private void MergeOtherAttributes(TagBuilder tag, RenderContext context)
	{
		var bindColor = GetBinding(nameof(Color));
		if (bindColor != null)
			tag.MergeAttribute(":class", $"'text-color-'+{bindColor.GetPath(context)}");
		else if (Color != TextColor.Default)
			tag.AddCssClass("text-color-" + Color.ToString().ToKebabCase());
		if (Float != FloatMode.None)
			tag.AddCssClass("float-" + Float.ToString().ToLowerInvariant());

	}
	public void MergeAttributesNoBlock(TagBuilder tag, RenderContext context, MergeAttrMode mode = MergeAttrMode.All)
	{
		base.MergeAttributes(tag, context, mode);
		MergeOtherAttributes(tag, context);
	}
}

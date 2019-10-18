// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.


using System;

using A2v10.Infrastructure;

namespace A2v10.Xaml
{
	public abstract class Inline : UIElement
	{
		public Boolean Block { get; set; }
		public TextColor Color { get; set; }
		public FloatMode Float { get; set; }

		public override void MergeAttributes(TagBuilder tag, RenderContext context, MergeAttrMode mode = MergeAttrMode.All)
		{
			base.MergeAttributes(tag, context, mode);
			tag.AddCssClassBool(Block, "block");
			var bindColor = GetBinding(nameof(Color));
			if (bindColor != null)
				tag.MergeAttribute(":class", $"'text-color-'+{bindColor.GetPath(context)}");
			else if (Color != TextColor.Default)
				tag.AddCssClass("text-color-" + Color.ToString().ToKebabCase());
			if (Float != FloatMode.None)
				tag.AddCssClass("float-" + Float.ToString().ToLowerInvariant());
		}
	}
}

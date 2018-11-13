// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.


using System;

using A2v10.Infrastructure;

namespace A2v10.Xaml
{
	public abstract class Inline : UIElement
	{
		public Boolean Block { get; set; }
		public TextColorStyle Color { get; set; }
		public FloatMode Float { get; set; }

		internal override void MergeAttributes(TagBuilder tag, RenderContext context, MergeAttrMode mode = MergeAttrMode.All)
		{
			base.MergeAttributes(tag, context, mode);
			tag.AddCssClassBool(Block, "block");
			if (Color != TextColorStyle.Default)
				tag.AddCssClass("text-color-" + Color.ToString().ToKebabCase());
			if (Float != FloatMode.None)
				tag.AddCssClass("float-" + Float.ToString().ToLowerInvariant());
		}
	}
}

// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.


using System;

namespace A2v10.Xaml
{
	public abstract class Inline : UIElement
	{
		public Boolean Block { get; set; }

		internal override void MergeAttributes(TagBuilder tag, RenderContext context, MergeAttrMode mode = MergeAttrMode.All)
		{
			base.MergeAttributes(tag, context, mode);
			tag.AddCssClassBool(Block, "block");
		}
	}
}

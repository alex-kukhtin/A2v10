// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Text;

using A2v10.Infrastructure;

namespace A2v10.Xaml
{
	public abstract class UIElement : UIElementBase
	{
		public Boolean? Bold { get; set; }
		public Boolean? Italic { get; set; }

		internal override void MergeAttributes(TagBuilder tag, RenderContext context, MergeAttrMode mode = MergeAttrMode.All)
		{
			base.MergeAttributes(tag, context, mode);

			var boldBind = GetBinding(nameof(Bold));
			var italicBind = GetBinding(nameof(Italic));
			if (boldBind != null || italicBind != null)
			{
				var sb = new StringBuilder("{");
				if (boldBind != null)
					sb.Append($"bold: {boldBind.GetPath(context)}, ");
				if (italicBind != null)
					sb.Append($"italic: {italicBind.GetPath(context)}, ");
				sb.RemoveTailComma();
				sb.Append("}");
				tag.MergeAttribute(":class", sb.ToString());
			}
			tag.AddCssClassBoolNo(Bold, "bold");
			tag.AddCssClassBoolNo(Italic, "italic");
		}
	}
}

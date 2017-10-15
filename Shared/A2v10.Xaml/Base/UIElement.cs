
using System;
using A2v10.Infrastructure;

namespace A2v10.Xaml
{
	public abstract class UIElement: UIElementBase
	{
		public Boolean? Bold { get; set; }
		public Boolean? Italic { get; set; }

		internal override void MergeAttributes(TagBuilder tag, RenderContext context)
		{
            base.MergeAttributes(tag, context);
            // TODO: Bold/Italic Binding
			if (Bold.HasValue)
				tag.AddCssClass(Bold.Value ? "bold" : "no-bold");
			if (Italic.HasValue)
				tag.AddCssClass(Italic.Value ? "italic" : "no-italic");
		}
    }
}

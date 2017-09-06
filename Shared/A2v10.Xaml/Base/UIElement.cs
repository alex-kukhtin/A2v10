using A2v10.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml
{
	public abstract class UIElement: UIElementBase
	{
		public Boolean? Bold { get; set; }
		public Boolean? Italic { get; set; }
        public String Tip { get; set; }

		internal virtual void MergeAttributes(TagBuilder tag, RenderContext context)
		{
            // TODO: Bold/Italic Binding
			if (Bold.HasValue)
				tag.AddCssClass(Bold.Value ? "bold" : "no-bold");
			if (Italic.HasValue)
				tag.AddCssClass(Italic.Value ? "italic" : "no-italic");
            MergeBindingAttributeString(tag, context, "title", "Tip", Tip);
		}
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml
{
	public class UIElement: XamlElement
	{
		public Boolean? Bold { get; set; }
		public Boolean? Italic { get; set; }

		internal void AddUiElementAttributes(TagBuilder tag)
		{
			if (Bold.HasValue)
				tag.AddCssClass(Bold.Value ? "text-bold" : "text-no-bold");
			if (Italic.HasValue)
				tag.AddCssClass(Italic.Value ? "text-italic" : "text-no-italic");
		}

        internal virtual void RenderElement(RenderContext context)
        {

        }
	}
}

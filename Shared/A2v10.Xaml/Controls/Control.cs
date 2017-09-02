using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml
{
	public abstract class Control : UIElement
	{
        public Boolean Block { get; set; }
        public String Label { get; set; }

        internal override void AddAttributes(TagBuilder tag, RenderContext context)
        {
            base.AddAttributes(tag, context);
            if (Block)
                tag.AddCssClass("block");
        }
    }
}

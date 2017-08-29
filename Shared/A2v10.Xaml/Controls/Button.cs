using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml
{
	public class Button : CommandControl
	{
        public Icon Icon { get; set; }

        internal override void RenderElement(RenderContext context)
        {
            var button = new TagBuilder("button", "btn");
            AddAttributes(button, context);
            button.RenderStart(context);
            RenderIcon(context, Icon);
            RenderContent(context);
            button.RenderEnd(context);
        }
    }
}

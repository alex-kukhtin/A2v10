using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml
{
	public class Button : CommandControl
	{

        internal override void RenderElement(RenderContext context)
        {
            var button = new TagBuilder("button", "btn");
            AddAttributes(button);

            button.RenderStart(context);
            RenderContent(context);
            button.RenderEnd(context);
        }
    }
}

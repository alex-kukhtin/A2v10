using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using A2v10.Infrastructure;
using System.Xaml;

namespace A2v10.Xaml
{
    public class XamlRenderer : IRenderer
    {
        public void Render(RenderInfo info)
        {
            if (String.IsNullOrEmpty(info.FileName))
                throw new XamlException("No source for render");

            String fileName = String.Empty;
            // XamlServices.Load sets IUriContext
            UIElementBase uiElem = null;
            if (!String.IsNullOrEmpty(info.FileName))
                uiElem = XamlServices.Load(info.FileName) as UIElementBase;
            else if (!String.IsNullOrEmpty(info.Text))
                uiElem = XamlServices.Parse(info.Text) as UIElementBase;
            else
                throw new XamlException("Xaml. There must be either a 'FileName' or a 'Text' property");
            if (uiElem == null)
                throw new XamlException("Xaml. Root is not 'UIElement'");

            RenderContext ctx = new RenderContext(info.Writer, uiElem);
            ctx.RootId = info.RootId; 
            uiElem.RenderElement(ctx);
        }
    }
}

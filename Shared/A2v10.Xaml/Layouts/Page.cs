using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Markup;

namespace A2v10.Xaml
{
    [ContentProperty("Children")]
    public class Page : RootContainer
    {

        public UIElement Toolbar { get; set; }
        public UIElement Taskpad { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            bool isGridPage = (Toolbar != null) || (Taskpad != null);
            var page = new TagBuilder("div", "page absolute");
            if (isGridPage)
            {
                page.AddCssClass("page-grid");
                if (Taskpad != null)
                {
                    var tp = Taskpad as Taskpad;
                    if (tp != null && tp.Width != null)
                    {
                        page.MergeStyle("grid-template-columns", $"1fr {tp.Width.Value}");
                    }
                }
            }
            page.MergeAttribute("id", context.RootId);
            page.RenderStart(context);

            if (isGridPage)
            {
                if (Toolbar != null)
                    Toolbar.RenderElement(context, (tag) => tag.AddCssClass("page-toolbar"));
                if (Taskpad != null)
                    Taskpad.RenderElement(context, (tag) => tag.AddCssClass("page-taskpad"));
                var content = new TagBuilder("div", "page-content").RenderStart(context);
                RenderChildren(context);
                content.RenderEnd(context);
            }
            else
                RenderChildren(context);
            page.RenderEnd(context);
        }
    }
}

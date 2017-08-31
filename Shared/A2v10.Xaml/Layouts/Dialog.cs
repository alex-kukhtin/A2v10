using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml
{
    public class Dialog : RootContainer
    {
        public String Title { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var dialog = new TagBuilder("div", "modal");
            dialog.MergeAttribute("id", context.RootId);
            dialog.RenderStart(context);

            RenderHeader(context);

            var content = new TagBuilder("div", "modal-header");
            content.RenderStart(context);
            RenderChildren(context);
            content.RenderEnd(context);

            RenderFooter(context);

            dialog.RenderEnd(context);
        }

        void RenderHeader(RenderContext context)
        {
            var header = new TagBuilder("div", "modal-header");
            header.RenderStart(context);
            var hdr = GetBinding(nameof(Title));
            header.RenderEnd(context);
        }

        void RenderFooter(RenderContext context)
        {

        }
    }
}

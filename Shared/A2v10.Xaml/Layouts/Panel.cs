using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml
{
    public class Panel : Container, ITableControl
    {
        public Object Header { get; set; }
        public Icon Icon { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var panel = new TagBuilder("div", "panel", IsInGrid);
            MergeAttributes(panel, context, MergeAttrMode.Standard);
            panel.RenderStart(context);
            RenderHeader(context);
            var content = new TagBuilder("div", "panel-content");
            MergeAttributes(content, context, MergeAttrMode.Margin | MergeAttrMode.Wrap);
            content.RenderStart(context);
            RenderChildren(context);
            content.RenderEnd(context);
            panel.RenderEnd(context);
        }

        Boolean HasHeader => GetBinding(nameof(Header)) != null || Header != null;

        void RenderHeader(RenderContext context)
        {
            if (!HasHeader)
                return;
            var header = new TagBuilder("div", "panel-header");
            var hBind = GetBinding(nameof(Header));
            if (hBind != null)
            {
                header.MergeAttribute("v-text", hBind.GetPathFormat(context));
            }
            header.RenderStart(context);
            if (Header is UIElementBase)
            {
                (Header as UIElementBase).RenderElement(context);
            }
            else if (Header != null)
            {
                context.Writer.Write(Header.ToString());
            }
            header.RenderEnd(context);
        }
    }
}

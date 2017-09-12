
using System;
using System.Windows.Markup;
using A2v10.Infrastructure;

namespace A2v10.Xaml
{
    public enum PopupPlacement
    {
        Top,
        Right,
        Bottom,
        Left
    }

    [ContentProperty("Content")]
    public class Popover : Inline
    {
        public PopupPlacement Placement { get; set; }
        public Object Content { get; set; }
        public String Text { get; set; }
        public Icon Icon { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var po = new TagBuilder("popover");
            MergeAttributes(po, context);
            po.AddCssClass("po-" + Placement.ToString().ToKebabCase());
            if (Icon != Icon.NoIcon)
                po.MergeAttribute("icon", Icon.ToString().ToKebabCase());
            MergeBindingAttributeString(po, context, "title", nameof(Text), Text);
            po.RenderStart(context);
            var cntBind = GetBinding(nameof(Content));
            if (cntBind != null)
            {
                var cont = new TagBuilder("span");
                cont.MergeAttribute("v-text", cntBind.GetPathFormat(context));
                cont.Render(context);
            }
            else if (Content is UIElementBase)
            { 
                (Content as UIElementBase).RenderElement(context);
            }
            else if (Content != null)
            {
                context.Writer.Write(Content.ToString());
            }                
            po.RenderEnd(context);
        }
    }
}

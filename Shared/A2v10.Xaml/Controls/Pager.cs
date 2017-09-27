using System;

namespace A2v10.Xaml
{
    public class Pager : UIElement
    {
        public Object Source { get; set; }
        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            //<a2-pager :source = "Parent.pager" />
            var pager = new TagBuilder("a2-pager");
            var source = GetBinding(nameof(Source));
            if (source == null)
                throw new XamlException("Pager has no Source binding");
            pager.MergeAttribute(":source", source.GetPath(context));
            pager.Render(context, TagRenderMode.Normal);
        }
    }
}

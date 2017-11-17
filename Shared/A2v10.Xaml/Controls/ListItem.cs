// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.


using System;
using System.Windows.Markup;

namespace A2v10.Xaml
{
    [ContentProperty("Content")]
    public class ListItem : UIElement
    {
        public Object Content { get; set; }
        public String Header { get; set; }
        public Icon Icon { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var div = new TagBuilder("div", "generic-list-item", IsInGrid);
            if (onRender != null)
                onRender(div);
            MergeAttributes(div, context);
            div.RenderStart(context);
            RenderIconBlock(context);
            RenderBody(context);
            div.RenderEnd(context);
        }

        Boolean HasHeader => GetBinding(nameof(Header)) != null || Header != null;
        Boolean HasBody => GetBinding(nameof(Content)) != null || Content != null;

        void RenderIconBlock(RenderContext context)
        {
            if (Icon == Icon.NoIcon)
                return;
            RenderIcon(context, Icon, "list-item-icon");
        }           
        
        void RenderBody(RenderContext context)
        {
            if (HasHeader)
            {
                var hTag = new TagBuilder("div", "list-item-header");
                var bHead = GetBinding(nameof(Header));
                if (bHead != null)
                {
                    hTag.MergeAttribute("v-text", bHead.GetPathFormat(context));
                }
                hTag.RenderStart(context);
                if (Header != null)
                    context.Writer.Write(Header.ToString());
                hTag.RenderEnd(context);
            }
            if (HasBody)
            {
                var hBody = new TagBuilder("div", "list-item-body");
                var bBody = GetBinding(nameof(Content));
                if (bBody != null)
                    hBody.MergeAttribute("v-text", bBody.GetPathFormat(context));
                hBody.RenderStart(context);
                if (Content is UIElementBase)
                    (Content as UIElementBase).RenderElement(context);
                else if (Content != null)
                    context.Writer.Write(Content.ToString());
                hBody.RenderEnd(context);
            }
        }
    }
}

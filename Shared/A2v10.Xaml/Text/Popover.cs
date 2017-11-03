// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.


using System;
using System.Windows.Markup;
using A2v10.Infrastructure;

namespace A2v10.Xaml
{
    public enum PopupPlacement
    {
        TopRight,
        TopLeft,
        RightBottom,
        RightTop,
        BottomRight,
        BottomLeft,
        LeftBottom,
        LeftTop
    }

    public enum PopoverBackgroundStyle
    {
        Default = 0,
        Yellow = Default,
        Cyan = 1,
        Green = 2,
        Red = 3,
        Blue = 4
    }

    [ContentProperty("Content")]
    public class Popover : Inline
    {
        public PopupPlacement Placement { get; set; }
        public Object Content { get; set; }
        public String Text { get; set; }
        public Icon Icon { get; set; }

        public String Url { get; set; }

        public PopoverBackgroundStyle Background { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var po = new TagBuilder("popover", "a2-inline", IsInGrid);
            MergeAttributes(po, context, MergeAttrMode.All);
            po.AddCssClass("po-" + Placement.ToString().ToKebabCase());
            if (Background != PopoverBackgroundStyle.Default)
                po.AddCssClass("po-" + Background.ToString().ToKebabCase());
            if (Icon != Icon.NoIcon)
                po.MergeAttribute("icon", Icon.ToString().ToKebabCase());
            MergeBindingAttributeString(po, context, "content", nameof(Text), Text);

            var urlBind = GetBinding(nameof(Url));
            if (urlBind != null)
                po.MergeAttribute(":url", urlBind.GetPathFormat(context));
            else if (!String.IsNullOrEmpty(Url))
                po.MergeAttribute("url", Url);

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

        protected override void OnEndInit()
        {
            base.OnEndInit();
            if (Background == PopoverBackgroundStyle.Yellow)
                Background = PopoverBackgroundStyle.Default;
        }
    }
}

// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;
using A2v10.Infrastructure;

namespace A2v10.Xaml
{
    [ContentProperty("Content")]
    public class List : Control, ITableControl
    {
        public Object ItemsSource { get; set; }
        public UIElementCollection Content { get; set; } = new UIElementCollection();
        public AutoSelectMode AutoSelect { get; set; }
        public Boolean Striped { get; set; }
        public Object Mark { get; set; }
        public Boolean Border { get; set; }

        public Length Height { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var ul = new TagBuilder("a2-list", null, IsInGrid);
            if (onRender != null)
                onRender(ul);
            var isBind = GetBinding(nameof(ItemsSource));
            ul.AddCssClassBool(Striped, "striped");
            ul.AddCssClassBool(Border, "border");

            var mbind = GetBinding(nameof(Mark));
            if (mbind != null)
            {
                ul.MergeAttribute("mark", mbind.GetPath(context));
            }
            else if (Mark != null)
            {
                throw new XamlException("The Mark property must be a binding");
            }

            if (isBind != null)
            {
                ul.MergeAttribute(":items-source", isBind.GetPath(context));
                ul.MergeAttribute("v-lazy", isBind.GetPath(context));
            }
            MergeAttributes(ul, context);
            if (Height != null)
                ul.MergeStyle("height", Height.Value);
            if (AutoSelect != AutoSelectMode.None)
                ul.MergeAttribute("auto-select", AutoSelect.ToString().ToKebabCase());
            ul.RenderStart(context);
            RenderBody(context, isBind != null);
            ul.RenderEnd(context);
        }

        void RenderBody(RenderContext context, Boolean dyna)
        {
            if (Content.Count == 0)
                return;
            var tml = new TagBuilder("template");
            if (dyna)
            {
                tml.MergeAttribute("slot", "items");
                tml.MergeAttribute("slot-scope", "listItem");
                tml.RenderStart(context);
                using (new ScopeContext(context, "listItem.item"))
                {
                    foreach (var c in Content)
                        c.RenderElement(context);
                }
                tml.RenderEnd(context);
            }
            else
            {
                tml.RenderStart(context);
                foreach (var c in Content)
                {
                    var li = new TagBuilder("li", "a2-list-item");
                    li.MergeAttribute("tabindex", "1");
                    //li.MergeAttribute("@click.prevent", "$exec('test')");
                    li.RenderStart(context);
                    c.RenderElement(context);
                    li.RenderEnd(context);
                }
                tml.RenderEnd(context);
            }
        }
    }
}

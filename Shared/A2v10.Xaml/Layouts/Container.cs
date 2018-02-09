// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;

namespace A2v10.Xaml
{
    [ContentProperty("Children")]
    public abstract class Container : UIElement
    {
        public UIElementCollection Children { get; set; } = new UIElementCollection();

        public Object ItemsSource { get; set; }

        internal virtual void RenderChildren(RenderContext context, Action<TagBuilder> onRenderStatic = null)
        {
            var isBind = GetBinding(nameof(ItemsSource));
            if (isBind != null)
            {
                var tml = new TagBuilder("template");
                tml.MergeAttribute("v-for", $"(xelem, xIndex) in {isBind.GetPath(context)}");
                tml.RenderStart(context);
                using (new ScopeContext(context, "xelem"))
                {
                    foreach (var c in Children)
                    {
                        c.RenderElement(context, (tag) =>
                        {
                            tag.MergeAttribute(":key", "xIndex");
                        });
                    }
                }
                tml.RenderEnd(context);
            }
            else
            {
                foreach (var c in Children)
                {
                    c.RenderElement(context, onRenderStatic);
                }
            }
        }

        protected override void OnEndInit()
        {
            base.OnEndInit();
            foreach (var c in Children)
                c.SetParent(this);
        }
    }
}

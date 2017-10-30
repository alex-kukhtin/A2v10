// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;

namespace A2v10.Xaml
{
    [ContentProperty("Children")]
    public abstract class Container : UIElement
    {
        public UIElementCollection Children { get; set; } = new UIElementCollection();

        internal virtual void RenderChildren(RenderContext context)
        {
            foreach (var c in Children)
            {
                c.RenderElement(context);
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

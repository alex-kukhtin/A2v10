// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;

namespace A2v10.Xaml.Controls
{
    [ContentProperty("ItemTemplate")]
    public class Repeater : UIElement
    {
        public Object ItemsSource { get; set; }
        public UIElementBase ItemTemplate { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            if (ItemTemplate == null)
                throw new XamlException("Invalid empty item template for Repeater");
            var bs = GetBinding(nameof(ItemsSource));
            if (bs == null)
                return;
            // TODO: wrap <div> with vFor
        }
    }
}

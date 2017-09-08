using System;
using System.Collections.Generic;
using System.Windows.Markup;

namespace A2v10.Xaml
{
    [ContentProperty("Content")]
    public class ComboBoxItem : UIElementBase
    {
        public String Content { get; set; }
        public Object Value { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var option = new TagBuilder("option");
            if (Value != null)
                option.MergeAttribute("value", Value.ToString());
            option.RenderStart(context);
            if (Content != null)
                context.Writer.Write(Content);
            option.RenderEnd(context);
        }
    }

    [ContentProperty("Children")]
    public class ComboBox : ValuedControl, ITableControl
    {
        List<ComboBoxItem> _children;
        public Object ItemsSource { get; set; }

        public List<ComboBoxItem> Children
        {
            get
            {
                if (_children == null)
                    _children = new List<ComboBoxItem>();
                return _children;
            }
        }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var combo = new TagBuilder("select", null, IsInGrid);
            if (onRender != null)
                onRender(combo);
            combo.MergeAttribute("is", "combobox");
            combo.MergeAttribute("v-cloak", String.Empty);
            MergeAttributes(combo, context);
            var isBind = GetBinding(nameof(ItemsSource));
            if (isBind != null)
                combo.MergeAttribute(":items-source", isBind.GetPath(context));
            MergeValue(combo, context);
            combo.RenderStart(context);
            if (_children != null)
            {
                foreach (var ch in Children)
                    ch.RenderElement(context);
            }
            combo.RenderEnd(context);
        }

        protected override void OnEndInit()
        {
            base.OnEndInit();
            if (_children != null)
                foreach (var ch in Children)
                    ch.SetParent(this);
        }
    }
}

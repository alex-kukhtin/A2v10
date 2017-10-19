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
            {
                if (Value is IJavaScriptSource)
                {
                    var jsValue = (Value as IJavaScriptSource).GetJsValue();
                    option.MergeAttribute(":value", jsValue);
                }
                else
                    option.MergeAttribute("value", Value.ToString());
            } else
            {
                option.MergeAttribute(":value", "null"); // JS null value
            }
            option.RenderStart(context);
            if (Content != null)
                context.Writer.Write(Content);
            option.RenderEnd(context);
        }
    }

    public class ComboBoxItems : List<ComboBoxItem>
    {

    }

    [ContentProperty("Children")]
    public class ComboBox : ValuedControl, ITableControl
    {
        ComboBoxItems _children;
        public Object ItemsSource { get; set; }

        public ComboBoxItems Children
        {
            get
            {
                if (_children == null)
                    _children = new ComboBoxItems();
                return _children;
            }
            set
            {
                _children = value;
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
            MergeDisabled(combo, context);
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

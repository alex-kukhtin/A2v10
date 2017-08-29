
using System;
using System.ComponentModel;
using System.Globalization;
using System.Collections.Generic;

namespace A2v10.Xaml
{
    [TypeConverter(typeof(UICollectionConverter))]
    public class UIElementCollection : List<UIElementBase>
    {
        public UIElementCollection()
        {

        }
    }

    public class UICollectionConverter : TypeConverter
    {
        public override bool CanConvertFrom(ITypeDescriptorContext context, Type sourceType)
        {
            if (sourceType == typeof(String))
                return true;
            else if (sourceType == typeof(UIElementBase))
                return true;
            return base.CanConvertFrom(context, sourceType);
        }

        public override object ConvertFrom(ITypeDescriptorContext context, CultureInfo culture, object value)
        {
            if (value == null)
                return null;
            if (value is String)
            {
                var x = new UIElementCollection();
                throw new NotImplementedException("Create UIElementCollection from String");
                /*
                var text = new Text();
                text.Content = value.ToString();
                x.Add(text);
                return x;
                */
            }
            else if (value is UIElementBase)
            {
                var x = new UIElementCollection();
                x.Add(value as UIElementBase);
                return x;
            }
            return base.ConvertFrom(context, culture, value);
        }
    }
}

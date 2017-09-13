using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml
{
    public enum WidthType {
        Pixel,
        Percent
    }

    [TypeConverter(typeof(WidthConverter))]
    public class Width
    {
        public String Value;
        public override string ToString()
        {
            return Value;
        }

        public static Width Fr1()
        {
            return new Width() { Value = "1fr" };
        }
    }

    public class WidthConverter: TypeConverter
    {
        public override bool CanConvertFrom(ITypeDescriptorContext context, Type sourceType)
        {
            if (sourceType == typeof(String))
                return true;
            else if (sourceType == typeof(Width))
                return true;
            return false;
        }

        public override object ConvertFrom(ITypeDescriptorContext context, CultureInfo culture, object value)
        {
            if (value == null)
                return null;
            if (value is String)
            {
                String strVal = value.ToString();
                Double dblVal = 0;
                if (strVal == "Auto")
                    return new Width() { Value = "auto" };
                else if (strVal.EndsWith("%"))
                    return new Width() { Value = strVal };
                else if (strVal.EndsWith("px"))
                    return new Width() { Value = strVal };
                else if (strVal.EndsWith("*"))
                    return new Width() { Value = strVal.Trim().Replace("*", "fr") };
                else if (Double.TryParse(strVal, out dblVal))
                    return new Width() { Value = strVal + "px" };
            }
            throw new XamlException($"Invalid width value '{value}'");
        }
    }
}

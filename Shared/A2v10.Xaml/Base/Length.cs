using System;
using System.ComponentModel;
using System.Globalization;

namespace A2v10.Xaml
{
    public enum LengthType {
        Pixel,
        Percent,
        Fraction
    }

    [TypeConverter(typeof(LengthConverter))]
    public class Length
    {
        public String Value;
        public override string ToString()
        {
            return Value;
        }

        public static Length Fr1()
        {
            return new Length() { Value = "1fr" };
        }
        public static Length FromString(String strVal)
        {
            Double dblVal = 0;
            if (strVal == "Auto")
                return new Length() { Value = "auto" };
            else if (strVal.EndsWith("%"))
                return new Length() { Value = strVal };
            else if (strVal.EndsWith("px"))
                return new Length() { Value = strVal };
            else if (strVal.EndsWith("*"))
                return new Length() { Value = strVal.Trim().Replace("*", "fr") };
            else if (Double.TryParse(strVal, out dblVal))
                return new Length() { Value = strVal + "px" };
            throw new XamlException($"Invalid length value '{strVal}'");
        }
    }

    public class LengthConverter: TypeConverter
    {
        public override bool CanConvertFrom(ITypeDescriptorContext context, Type sourceType)
        {
            if (sourceType == typeof(String))
                return true;
            else if (sourceType == typeof(Length))
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
                return Length.FromString(strVal);
            }
            throw new XamlException($"Invalid length value '{value}'");
        }
    }
}

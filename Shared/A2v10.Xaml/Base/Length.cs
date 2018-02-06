// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.ComponentModel;
using System.Globalization;

namespace A2v10.Xaml
{
    public enum LengthType {
        Pixel,
        Percent
    }

    public enum GridLengthType
    {
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

        public Boolean IsEmpty => String.IsNullOrEmpty(Value);

        public static Length FromString(String strVal)
        {
            strVal = strVal.Trim();
            Double dblVal = 0;
            if (strVal == "Auto")
                return new Length() { Value = "auto" };
            else if (strVal.StartsWith("calc("))
                return new Length() { Value = strVal };
            else if (strVal.EndsWith("%"))
                return new Length() { Value = strVal };
            else if (strVal.EndsWith("px"))
                return new Length() { Value = strVal };
            else if (strVal.EndsWith("em"))
                return new Length() { Value = strVal };
            else if (strVal.EndsWith("rem"))
                return new Length() { Value = strVal };
            else if (Double.TryParse(strVal, out dblVal))
                return new Length() { Value = strVal + "px" };
            throw new XamlException($"Invalid length value '{strVal}'");
        }
    }

    [TypeConverter(typeof(GridLengthConverter))]
    public class GridLength
    {
        public String Value;
        public override string ToString()
        {
            return Value;
        }

        public static GridLength Fr1()
        {
            return new GridLength() { Value = "1fr" };
        }
        public static GridLength FromString(String strVal)
        {
            Double dblVal = 0;
            if (strVal == "Auto")
                return new GridLength() { Value = "auto" };
            else if (strVal.EndsWith("%"))
                return new GridLength() { Value = strVal };
            else if (strVal.EndsWith("px"))
                return new GridLength() { Value = strVal };
            if (strVal.EndsWith("*"))
                return new GridLength() { Value = strVal.Trim().Replace("*", "fr") };
            else if (Double.TryParse(strVal, out dblVal))
                return new GridLength() { Value = strVal + "px" };
            throw new XamlException($"Invalid grid length value '{strVal}'");
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

    public class GridLengthConverter : TypeConverter
    {
        public override bool CanConvertFrom(ITypeDescriptorContext context, Type sourceType)
        {
            if (sourceType == typeof(String))
                return true;
            else if (sourceType == typeof(GridLength))
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
                return GridLength.FromString(strVal);
            }
            throw new XamlException($"Invalid length value '{value}'");
        }
    }
}

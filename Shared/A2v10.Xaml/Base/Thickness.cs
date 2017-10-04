using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml
{
    [TypeConverter(typeof(ThicknessConverter))]
    public class Thickness
    {
        public Length Top { get; set; }
        public Length Right { get; set; }
        public Length Bottom { get; set; }
        public Length Left { get; set; }

        public static Thickness FromString(String str)
        {
            if (String.IsNullOrEmpty(str))
                return null;
            var t = new Thickness();
            var elems = str.Split(',');
            if (elems.Length == 1)
            {
                t.Top = Length.FromString(elems[0]);
                t.Left = t.Top;
                t.Right = t.Top;
                t.Bottom = t.Top;
            }
            else if (elems.Length == 2)
            {
                t.Top = Length.FromString(elems[0]);
                t.Bottom = t.Top;
                t.Left = Length.FromString(elems[1]);
                t.Right = t.Left;
            }
            else if (elems.Length == 4)
            {
                t.Top = Length.FromString(elems[0]);
                t.Right = Length.FromString(elems[1]);
                t.Bottom = Length.FromString(elems[2]);
                t.Left = Length.FromString(elems[3]);
            }
            else
            {
                throw new XamlException($"Invalid Thickness value '{str}'");
            }
            return t;
        }

        internal void MergeStyles(String styleProp, TagBuilder tag)
        {
            if (Left == Right && Left == Top && Left == Bottom)
                tag.MergeStyle(styleProp, Left.Value);
            else if (Left == Right && Top == Bottom)
                tag.MergeStyle(styleProp, $"{Top.Value} {Left.Value}");
            else
                tag.MergeStyle(styleProp, $"{Top.Value} {Right.Value} {Bottom.Value} {Left.Value}");
        }
    }

    public class ThicknessConverter : TypeConverter
    {
        public override bool CanConvertFrom(ITypeDescriptorContext context, Type sourceType)
        {
            if (sourceType == typeof(String))
                return true;
            else if (sourceType == typeof(Thickness))
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
                return Thickness.FromString(strVal);
            }
            throw new XamlException($"Invalid Thickness value '{value}'");
        }
    }

}

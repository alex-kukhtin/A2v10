using System;
using System.ComponentModel;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Globalization;

namespace A2v10.Xaml
{
    [TypeConverter(typeof(ConfirmConverter))]
    public class Confirm : XamlElement
    {
        public String Message { get; set; }
        public String Title { get; set; }
        public String OkText { get; set; }
        public String CancelText { get; set; }

        internal String GetJsValue(RenderContext context)
        {
            String msg = GetBindingString(context, nameof(Message), Message);
            String title = GetBindingString(context, nameof(Title), Title);
            String okText = GetBindingString(context, nameof(OkText), OkText);
            String cancelText = GetBindingString(context, nameof(CancelText), CancelText);
            if (title != null)
                title = $", title:{title}";
            if (okText != null)
                okText = $", okText:{okText}";
            if (cancelText != null)
                cancelText = $", cancelText:{cancelText}";
            return $", {{message: {msg}{title}{okText}{cancelText}}}";
        }

        internal String GetBindingString(RenderContext context, String propertyName, String propValue)
        {
            String resVal = null;
            var bindString = GetBinding(propertyName);
            if (bindString != null)
                resVal = bindString.GetPathFormat(context);
            else if (propValue != null)
                resVal = $"'{propValue}'";
            return resVal;
        }
    }

    public class ConfirmConverter : TypeConverter
    {
        public override bool CanConvertFrom(ITypeDescriptorContext context, Type sourceType)
        {
            if (sourceType == typeof(String))
                return true;
            else if (sourceType == typeof(Confirm))
                return true;
            return false;
        }

        public override object ConvertFrom(ITypeDescriptorContext context, CultureInfo culture, object value)
        {
            if (value == null)
                return null;
            if (value is String)
                return new Confirm() { Message = value.ToString() };
            else if (value is Confirm)
                return value as Confirm;
            throw new XamlException($"Invalid Confirm value '{value}'");
        }
    }
}

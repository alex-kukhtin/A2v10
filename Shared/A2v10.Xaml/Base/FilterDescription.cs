using System;
using System.Text;
using System.Collections.Generic;
using System.Windows.Markup;

using A2v10.Infrastructure;

namespace A2v10.Xaml
{

    public class FilterItem
    {
        public String Property { get; set; }
        public Object Value { get; set; }
        public DataType DataType { get; set; }

        internal String GetJsValue()
        {
            switch (DataType)
            {
                case DataType.String:
                    return Value == null ? "''" : $"'{Value}'";
                case DataType.Number:
                case DataType.Currency:
                    return Value == null ? "0" : $"+{Value}";
                default:
                    throw new NotImplementedException("type for FilterItem");
            }
        }
    }

    public class FilterItems : List<FilterItem>
    {

    }

    [ContentProperty("Items")]
    public class FilterDescription : IJavaScriptSource
    {
        public FilterItems Items { get; set; } = new FilterItems();

        public String GetJsValue()
        {
            var sb = new StringBuilder();
            sb.Append("{");
            foreach (var itm in Items)
            {
                sb.Append($"{itm.Property.EncodeJs()}: {itm.GetJsValue()}, ");
            }
            sb.RemoveTailComma();
            sb.Append("}");
            return sb.ToString();
        }
    }
}

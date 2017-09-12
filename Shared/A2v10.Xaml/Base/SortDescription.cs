using A2v10.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml
{
    public enum SortDirection
    {
        Asc,
        Desc,
    }

    public class SortDescription : IJavaScriptSource
    {
        public String Property { get; set; }

        public SortDirection Dir { get; set; }

        public String GetJsValue()
        {
            return $"{{order: '{Property.EncodeJs()}', dir: '{Dir.ToString().ToLowerInvariant()}' }}";
        }
    }
}

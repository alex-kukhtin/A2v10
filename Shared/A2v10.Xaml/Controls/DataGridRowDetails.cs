using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Markup;

namespace A2v10.Xaml
{

    [ContentProperty("Content")]
    public class DataGridRowDetails : XamlElement
    {
        public UIElementBase Content { get; set; }
        public RowDetailsActivate Activate { get; set; }
        public Boolean Visible { get; set; }
    }
}

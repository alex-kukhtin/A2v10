using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Markup;

namespace A2v10.Xaml.Controls
{
    [ContentProperty("ItemsSource")]
    public class ComboBox : ValuedControl
    {
        public Object ItemsSource { get; set; }

        internal override void RenderElement(RenderContext context)
        {
            base.RenderElement(context);
        }
    }
}

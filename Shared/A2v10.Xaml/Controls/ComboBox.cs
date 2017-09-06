using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Markup;

namespace A2v10.Xaml
{
    [ContentProperty("ItemsSource")]
    public class ComboBox : ValuedControl, ITableControl
    {
        public Object ItemsSource { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var combo = new TagBuilder("select", null, IsInGrid);
            if (onRender != null)
                onRender(combo);
            combo.RenderStart(context);
            combo.RenderEnd(context);
        }
    }
}

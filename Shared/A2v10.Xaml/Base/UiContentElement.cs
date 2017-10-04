using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Markup;

namespace A2v10.Xaml
{
    [ContentProperty("Content")]
    public abstract class UiContentElement : UIElementBase
    {
        public Object Content { get; set; }

        internal void MergeContent(TagBuilder tag, RenderContext context)
        {
            var contBind = GetBinding(nameof(Content));
            if (contBind != null)
                tag.MergeAttribute("v-text", contBind.GetPathFormat(context));
        }

        internal void RenderContent(RenderContext context)
        {
            RenderContent(context, Content);
        }

    }
}

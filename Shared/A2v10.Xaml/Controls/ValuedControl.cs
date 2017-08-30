using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml
{
    public abstract class ValuedControl : Control
    {
       public Object Value { get; set; }

       internal void MergeValue(TagBuilder input, RenderContext context)
       {
            var valBind = GetBinding(nameof(Value));
            if (valBind != null) {
                // split to path and property
                String path = valBind.Path;
                String itemPath = String.Empty;
                String itemProp = String.Empty;
                if (String.IsNullOrEmpty(path))
                    return;
                int ix = path.LastIndexOf('.');
                if (ix == -1)
                {
                    itemProp = path;
                    itemPath = context.GetCurrentScope();
                }
                else
                {
                    itemProp = path.Substring(ix + 1);
                    itemPath = context.GetNormalizedPath(path.Substring(0, ix));
                }

                if (String.IsNullOrEmpty(itemPath) || String.IsNullOrEmpty(itemProp))
                    throw new XamlException($"invalid binding for Value '{path}'");
                input.MergeAttribute(":item", itemPath);
                input.MergeAttribute("prop", itemProp);
            }
       }
    }
}

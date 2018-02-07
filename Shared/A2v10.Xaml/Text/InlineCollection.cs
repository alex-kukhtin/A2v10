// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;

namespace A2v10.Xaml
{
    public sealed class InlineCollection : List<Object>
    {
        internal void Render(RenderContext context)
        {
            foreach (var x in this) {
                if (x == null)
                    continue;
                if (x is String)
                    context.Writer.Write(context.Localize(x.ToString()));
                else if (x is Inline)
                    (x as Inline).RenderElement(context);
                else
                    throw new XamlException($"Invalid inline element '{x.GetType().ToString()}'");
            }
        }
    }
}

// Copyright © 2025 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml;

public class MultiSelect : ValuedControl, ITableControl
{
    public String Placeholder { get; set; }
    public String Url { get; set; }
    public Boolean Highlight { get; set; }
    public String Data { get; set; }

    public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
    {
        throw new XamlException("This control is only supported in the .NET Core version.");
    }
}

// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using A2v10.Infrastructure;
using System;

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

// Copyright © 2015-2025 Oleksandr Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.Linq;

using A2v10.Infrastructure;

namespace A2v10.Xaml;

internal static class StringExtensions
{
    private static String ToJsonString(ExpandoObject o)
    {
        var e = String.Join(",", o.Select(kv => $"{kv.Key}: '{kv.Value}'"));
        return $"{{{e}}}";
    }
    public static (String, String) ParseUrlQuery(this String urlQuery)
    {
        var url = urlQuery;
        ExpandoObject query = null;
        if (url != null && url.Contains('?'))
        {
            var urlSplit = url.Split('?');
            url = urlSplit[0];

            var qs = urlSplit[1].Split('&').ToDictionary(c => c.Split('=')[0], c => c.Split('=')[1]);
            query = new ExpandoObject();
            foreach (var kv in qs)
            {
                if (kv.Key != null && kv.Value != null)
                    query.Add(kv.Key, kv.Value);
            }
            if (query.IsEmpty())
                query = null;
        }
        return (url, query != null ? ToJsonString(query) : null);
    }
}

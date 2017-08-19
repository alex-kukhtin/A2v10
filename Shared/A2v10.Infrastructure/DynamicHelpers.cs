using System;
using System.Collections.Generic;
using System.Dynamic;

namespace A2v10.Infrastructure
{
    public static class DynamicHelpers
    {
        public static T Get<T>(this ExpandoObject obj, String name)
        {
            var d = obj as IDictionary<String, Object>;
            if (d == null)
                return default(T);
            Object result;
            if (d.TryGetValue(name, out result))
            {
                if (result is T)
                    return (T)result;
            }
            return default(T);
        }

        public static void Set(this ExpandoObject obj, String name, Object value)
        {
            var d = obj as IDictionary<String, Object>;
            if (d == null)
                return;
            if (d.ContainsKey(name))
                d[name] = value;
            else
                d.Add(name, value);
        }
    }
}

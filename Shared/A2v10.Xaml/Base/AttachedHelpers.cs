using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml
{
    internal static class AttachedHelpers
    {
        internal static void SetAttached<T>(Lazy<IDictionary<Object, T>> dict, Object obj, T val)
        {
            if (dict.Value.ContainsKey(obj))
                dict.Value[obj] = val;
            else
                dict.Value.Add(obj, val);
        }
        internal static T GetAttached<T>(Lazy<IDictionary<Object, T>> dict, Object obj)
        {
            if (!dict.IsValueCreated)
                return default(T);
            T val;
            if (dict.Value.TryGetValue(obj, out val))
                return val;
            return default(T);
        }
    }
}

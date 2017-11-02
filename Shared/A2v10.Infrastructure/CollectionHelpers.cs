using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Infrastructure
{
    public static class CollectionHelpers
    {
        public static IDictionary<TKey, TValue> Append<TKey, TValue>(this IDictionary<TKey, TValue> dst, IDictionary<TKey, TValue> src, Boolean replaceExisiting = false)
        {
            if (src == null)
                return dst;
            foreach (var c in src)
            {
                if (!dst.ContainsKey(c.Key))
                    dst.Add(c.Key, c.Value);
                if (replaceExisiting)
                    dst[c.Key] = c.Value;
            }
            return dst;
        }
    }
}

// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

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

        public static Boolean HasProperty(this ExpandoObject obj, String name)
        {
            var d = obj as IDictionary<String, Object>;
            if (d == null)
                return false;
            return d.ContainsKey(name);
        }

        public static void Append(this ExpandoObject obj, NameValueCollection coll, Boolean toPascalCase = false)
        {
            if (coll == null)
                return;
            var d = obj as IDictionary<String, Object>;
            foreach (var key in coll.Keys)
            {
                var skey = key.ToString();
                if (toPascalCase)
                    skey = skey.ToPascalCase();
                d.Add(skey, coll[key.ToString()]);
            }
        }

        public static ExpandoObject RemoveEmptyArrays(this ExpandoObject obj)
        {
            if (obj == null)
                return obj;
            var dict = obj as IDictionary<String, Object>;
            var arr = dict.Keys.ToList();
            foreach (var key in arr)
            {
                var val = dict[key];
                if (val is IList<ExpandoObject>)
                {
                    var list = val as IList<ExpandoObject>;
                    if (list != null)
                    {
                        if (list.Count == 0)
                            dict[key] = null;
                        else
                        {
                            foreach (var l in list)
                                l.RemoveEmptyArrays();
                        }
                    }
                }
                else if (val is ExpandoObject)
                {
                    (val as ExpandoObject).RemoveEmptyArrays();
                }
            }
            return obj;
        }

        public static Object EvalExpression(this ExpandoObject root, String expression)
        {
            Object currentContext = root;
            foreach (var exp in expression.Split('.'))
            {
                if (currentContext == null)
                    return null;
                String prop = exp.Trim();
                var d = currentContext as IDictionary<String, Object>;
                if (prop.Contains("["))
                {
                    var match = new Regex(@"(\w+)\[(\d+)\]{1}").Match(prop);
                    prop = match.Groups[1].Value;
                    if ((d != null) && d.ContainsKey(prop))
                    {
                        var x = d[prop] as IList<ExpandoObject>;
                        currentContext = x[Int32.Parse(match.Groups[2].Value)];
                    }
                    else
                        return null;
                }
                else
                {
                    if ((d != null) && d.ContainsKey(prop))
                        currentContext = d[prop];
                    else
                        return null;
                }
            }
            return currentContext;
        }

        public static T Eval<T>(this ExpandoObject root, String expression, T fallback = default(T))
        {
            if (expression == null)
                return fallback;
            Object result = root.EvalExpression(expression);
            if (result == null)
                return fallback;
            if (result is T)
                return (T) result;
            return fallback;
        }

        public static String Resolve(this ExpandoObject This, String source)
        {
            var r = new Regex("\\{\\{(.+?)\\}\\}");
            var ms = r.Matches(source);
            if (ms.Count == 0)
                return source;
            var sb = new StringBuilder(source);
            foreach (Match m in ms)
            {
                String key = m.Groups[1].Value;
                String val = This.EvalExpression(key)?.ToString();
                sb.Replace(m.Value, val);
            }
            return sb.ToString();
        }

    }
}

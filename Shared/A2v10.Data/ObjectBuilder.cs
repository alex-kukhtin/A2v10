// Copyright © 2012-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Dynamic;

namespace A2v10.Data
{
    // optimized for arrays

    internal class ObjectBuilder
    {
        static Object CreateObjectSimple(Object source, Signature sign, String path)
        {
            if (!(source is ExpandoObject))
                throw new DataDynamicException($"Invalid dynamic object. {sign.ToString()}");
            var type = ClassFactory.CreateClass(sign.properties);
            var target = System.Activator.CreateInstance(type);
            SetProperties(source, target, path);
            return target;
        }

        static Object CreateObject(Object source, String path)
        {
            if (source == null)
                return null;
            if (source is ExpandoObject)
            {
                var sign = new Signature(source);
                return CreateObjectSimple(source, sign, path);
            }
            else if (source is IList<ExpandoObject>)
            {
                var retList = new List<Object>();
                Signature arraySign = null;
                foreach (var listItem in source as List<ExpandoObject>)
                {
                    if (listItem is ExpandoObject)
                    {
                        if (arraySign == null)
                            arraySign = new Signature(listItem);
                        retList.Add(CreateObjectSimple(listItem, arraySign, path));
                    }
                    else
                    {
                        retList.Add(listItem);
                    }
                }
                return retList;
            }
            return source;
        }

        static void SetProperties(Object source, Object target, String path)
        {
            var props = target.GetType().GetProperties();
            var dict = source as IDictionary<String, Object>;
            foreach (var prop in props)
            {
                if (dict.ContainsKey(prop.Name))
                {
                    var val = dict[prop.Name];
                    prop.SetValue(target, CreateObject(val, path + "." + prop.Name));
                }
            }
        }

        public static Dictionary<String, Object> BuildObject(ExpandoObject root)
        {
            var list = new Dictionary<String, Object>();
            var rootD = root as IDictionary<String, Object>;
            foreach (var obj in rootD)
            {
                list.Add(obj.Key, CreateObject(obj.Value, obj.Key));
            }
            return list;
        }
    }
}

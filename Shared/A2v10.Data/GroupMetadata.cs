// Copyright © 2012-2017 Alex Kukhtin. All rights reserved.

using A2v10.Infrastructure;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Dynamic;
using System.Linq;
using System.Text;

namespace A2v10.Data
{
    public class GroupMetadata
    {
        IList<String> _fields = null;

        IDictionary<String, ExpandoObject> _cache;

        public String RootKey { get { return "[ROOT]\b"; } }

        public void AddMarkerMetadata(String fieldName)
        {
            if (_fields == null)
                _fields = new List<String>();
            _fields.Add(fieldName);
        }

        public Boolean IsRoot(IList<Boolean> groups)
        {
            if (groups.Count != _fields.Count)
                throw new DataLoaderException("Invalid group");
            return groups.Count(x => x == true) == _fields.Count;
        }

        public Boolean IsLeaf(IList<Boolean> groups)
        {
            if (groups.Count != _fields.Count)
                throw new DataLoaderException("Invalid group");
            return groups.Count(x => x == false) == _fields.Count;
        }

        public void CacheElement(String key, ExpandoObject record)
        {
            if (_cache == null)
                _cache = new Dictionary<String, ExpandoObject>();
            if (_cache.ContainsKey(key))
                throw new DataLoaderException($"Group.Cache. Element with the key '{key}' already has been added.");
            _cache.Add(key, record);
        }

        public ExpandoObject GetCachedElement(String key)
        {
            if (_cache == null)
                throw new DataLoaderException($"Group.Cache. There is no element with the key '{key}'.");
            ExpandoObject val;
            if (_cache.TryGetValue(key, out val))
                return val;
            throw new DataLoaderException($"Group.Cache. There is no element with the key '{key}'.");
        }

        public Tuple<String, String> GetKeys(IList<Boolean> groupKeys, ExpandoObject currentRecord)
        {
            StringBuilder sbKey = new StringBuilder(RootKey);
            StringBuilder sbParent = new StringBuilder(RootKey);
            String value = null;
            // the groupKeys array is already sorted (SQL)
            for (int i= 0; i < groupKeys.Count; i++)
            {
                if (groupKeys[i])
                    break; // here and below - only groups 
                if (value != null)
                    sbParent.Append($"[{value}]\b"); // prev tick
                var fieldName = _fields.ElementAt(i);
                value = currentRecord.Get<Object>(fieldName)?.ToString() ?? String.Empty;
                sbKey.Append($"[{value}]\b");
            }
            return Tuple.Create(sbKey.ToString(), sbParent.ToString());
        }
    }
}

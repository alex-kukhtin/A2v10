// Copyright © 2012-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Data
{
    class LoadHelper<T> where T : class
    {
        Type _type;
        PropertyInfo[] _props;
        Dictionary<String, Int32> _keyMap;
        public LoadHelper()
        {
            _type = typeof(T);
            _props = _type.GetProperties(BindingFlags.Public | BindingFlags.Instance);
        }

        public void ProcessRecord(IDataReader rdr)
        {
            _keyMap = new Dictionary<String, Int32>();
            for (int c = 0; c < rdr.FieldCount; c++)
            {
                _keyMap.Add(rdr.GetName(c), c);
            }
        }
        public T ProcessFields(IDataReader rdr)
        {
            T result = System.Activator.CreateInstance(_type) as T;
            Int32 fieldIndex;
            foreach (var p in _props)
            {
                if (_keyMap.TryGetValue(p.Name, out fieldIndex))
                {
                    var dbVal = rdr.GetValue(fieldIndex);
                    if (dbVal == DBNull.Value)
                        dbVal = null;
                    p.SetValue(result, dbVal);
                }
            }
            return result;
        }
    }
}

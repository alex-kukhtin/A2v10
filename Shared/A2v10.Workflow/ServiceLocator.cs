using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Workflow
{
    internal static class ServiceLocator
    {
        static IDictionary<String, Object> _storage = new ConcurrentDictionary<String, Object>();
        internal static void Register<T>(T service) where T : class
        {
            Type t = typeof(T);
            Object val;
            if (_storage.TryGetValue(t.FullName, out val))
            {
                if (val != service)
                    throw new WorkflowException($"Service registration error. ({t.FullName})");
                return;
            }
            _storage.Add(t.FullName, service);
        }

        internal static T GetService<T>() where T : class
        {
            Type t = typeof(T);
            Object val;
            if (_storage.TryGetValue(t.FullName, out val))
                return val as T;
            throw new WorkflowException($"Service is not registratied. ({t.FullName})");
        }
    }
}

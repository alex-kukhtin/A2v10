// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;

namespace A2v10.Infrastructure
{
    public interface IServiceLocator
    {
        T GetService<T>() where T:class;
        void RegisterService<T>(T service) where T:class;
    }

    public class ServiceLocator : IServiceLocator
    {
        static Dictionary<Type, Object> _services = new Dictionary<Type, Object>();
        static ServiceLocator _current = new ServiceLocator();

        public static IServiceLocator Current { get { return _current; } }

        public T GetService<T>() where T : class
        {
            Object result;
            if (_services.TryGetValue(typeof(T), out result))
                return result as T;
            throw new InvalidOperationException($"Service '{typeof(T).FullName}' not registered");
        }

        public void RegisterService<T>(T service) where T:class
        {
            _services.Add(typeof(T), service);
        }
    }
}

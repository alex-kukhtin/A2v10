// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;

namespace A2v10.Infrastructure
{
	public interface IServiceLocator
	{
		T GetService<T>() where T : class;
		T GetServiceOrNull<T>() where T : class;
		Object GetService(Type type);
		void RegisterService<T>(T service) where T : class;
		Boolean IsServiceRegistered<T>() where T : class;
		void Stop();
	}

	public class ServiceLocator : IServiceLocator
	{
		public static Action<IServiceLocator> Start { get; set; }
		public static Func<IServiceLocator> GetCurrentLocator { get; set; }


		public ServiceLocator()
		{
			ServiceLocator.Start(this);
		}

		public void Stop()
		{
			foreach (var s in _services)
				if (s.Value is ISupportStopService)
					(s.Value as ISupportStopService).Stop();
		}

		public static IServiceLocator Current => ServiceLocator.GetCurrentLocator();

		Dictionary<Type, Object> _services = new Dictionary<Type, Object>();

		public T GetService<T>() where T : class
		{
			if (_services.TryGetValue(typeof(T), out Object result))
				return result as T;
			throw new InvalidOperationException($"Service '{typeof(T).FullName}' not registered");
		}

		public T GetServiceOrNull<T>() where T : class
		{
			if (_services.TryGetValue(typeof(T), out Object result))
				return result as T;
			return null;
		}

		public Object GetService(Type type)
		{
			if (_services.TryGetValue(type, out Object result))
				return result;
			throw new InvalidOperationException($"Service '{type.FullName}' not registered");
		}


		public void RegisterService<T>(T service) where T : class
		{
			_services.Add(typeof(T), service);
		}

		public Boolean IsServiceRegistered<T>() where T : class
		{
			return _services.ContainsKey(typeof(T));
		}
	}
}

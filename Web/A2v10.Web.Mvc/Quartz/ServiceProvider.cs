// Copyright © 2015-2022 Oleksandr Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;

namespace A2v10.Web.Mvc.Quartz;

internal class ServiceProvider : IServiceProvider
{
	private Dictionary<Type, Object> _services = new Dictionary<Type, Object>();
	public object GetService(Type serviceType)
	{
		if (_services.TryGetValue(serviceType, out Object service))
			return service;
		throw new InvalidOperationException($"Service '{serviceType?.Name}' not found");
	}

	public void RegisterService<T>(T service) where T : class
	{
		_services.Add(typeof(T), service);
	}
}

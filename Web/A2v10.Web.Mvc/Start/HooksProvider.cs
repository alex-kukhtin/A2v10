// Copyright © 2022 Alex Kukhtin. All rights reserved.

using System;
using System.Configuration;

using A2v10.Infrastructure;
using A2v10.Web.Mvc.Interfaces;

namespace A2v10.Web.Mvc.Start;

public class HooksProvider : IHooksProvider
{
	private readonly String _hooksClr;
	private ISessionHooks _sessionHooks;
	public HooksProvider()
	{
		_hooksClr = ConfigurationManager.AppSettings["sessionHooks"];
	}
	public ISessionHooks SessionHooks
	{
		get
		{
			if (String.IsNullOrEmpty(_hooksClr))
				return null;
			if (_sessionHooks == null)
				_sessionHooks = ServiceLocator.Current.GetService<ISessionHooks>(sp =>
					ClrHelpers.LoadObjectSP<ISessionHooks>(_hooksClr, sp));
			return _sessionHooks;
		}
	}
}

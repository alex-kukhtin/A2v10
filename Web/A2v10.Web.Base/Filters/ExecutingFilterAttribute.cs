// Copyright © 2015-2022 Alex Kukhtin. All rights reserved.

using System;
using System.Web.Mvc;
using A2v10.Infrastructure;

namespace A2v10.Web.Base;

[AttributeUsage(AttributeTargets.Class, AllowMultiple = false, Inherited = true)]
public sealed class ExecutingFilterAttribute : ActionFilterAttribute
{
	IProfileRequest _request;
	public override void OnActionExecuting(ActionExecutingContext filterContext)
	{
		base.OnActionExecuting(filterContext);
		if (filterContext.Controller is IControllerTenant iCtrlTenant)
			iCtrlTenant.StartTenant();
		if (filterContext.Controller is IControllerLocale iCtrlLocale)
			iCtrlLocale.SetLocale();
		if (filterContext.Controller is IControllerSession iCtrlSession)
		{
			if (!iCtrlSession.IsSessionValid())
			{
				return;
			}
		}
		if (!(filterContext.Controller is IControllerProfiler iCtrl))
			return;
		var ctrl = filterContext.Controller as Controller;
		if (ctrl != null && iCtrl.SkipRequest(ctrl.Request.Url.LocalPath))
			return;
		_request = iCtrl.Profiler.BeginRequest(ctrl.Request.Url.PathAndQuery, ctrl.Session.SessionID);
	}

	public override void OnResultExecuted(ResultExecutedContext filterContext)
	{
		base.OnResultExecuted(filterContext);
		if (_request != null)
			_request.Stop();
		ServiceLocator.Current.Stop();
	}
}

// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Web.Mvc;
using A2v10.Infrastructure;

namespace A2v10.Web.Mvc.Filters
{
	public class ExecutingFilterAttribute : ActionFilterAttribute
	{
		IProfileRequest _request;
		public override void OnActionExecuting(ActionExecutingContext filterContext)
		{
			base.OnActionExecuting(filterContext);
			if (filterContext.Controller is IControllerTenant iCtrlTenant)
				iCtrlTenant.StartTenant();
			if (!(filterContext.Controller is IControllerProfiler iCtrl))
				return;
			var ctrl = filterContext.Controller as Controller;
			if (iCtrl.SkipRequest(ctrl.Request.Url.LocalPath))
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
}

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
            var iCtrlTenant = filterContext.Controller as IControllerTenant;
            if (iCtrlTenant != null)
                iCtrlTenant.StartTenant();
            var iCtrl = filterContext.Controller as IControllerProfiler;
            if (iCtrl == null)
                return;
            var ctrl = filterContext.Controller as Controller;
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

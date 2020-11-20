// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.


using System;
using System.Web.Helpers;
using System.Web.Mvc;

namespace A2v10.Web.Mvc.Filters
{
	[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = false, Inherited = true)]
	public sealed class ValidateJsonAntiForgeryTokenAttribute : FilterAttribute, IAuthorizationFilter
	{
		public void OnAuthorization(AuthorizationContext filterContext)
		{
			var httpContext = filterContext.HttpContext;
			var cookie = httpContext.Request.Cookies[AntiForgeryConfig.CookieName]?.Value;
			if (cookie == null)
				throw new HttpAntiForgeryException();
			var header = httpContext.Request.Headers["__RequestVerificationToken"];
			AntiForgery.Validate(cookie, header);
		}
	}

	[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = false, Inherited = true)]
	public sealed class HandlAntiForgeryExecptionAttribute : FilterAttribute, IExceptionFilter
	{
		public void OnException(ExceptionContext exceptionContext)
		{
			if (!exceptionContext.ExceptionHandled && exceptionContext.Exception is HttpAntiForgeryException) {
				exceptionContext.Result = new JsonResult() { Data = new { Status = "AntiForgery" } };
				exceptionContext.ExceptionHandled = true;
			}
		}
	}
}

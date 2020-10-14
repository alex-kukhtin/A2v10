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
			var header = httpContext.Request.Headers["__RequestVerificationToken"];
			AntiForgery.Validate(cookie, header);
		}
	}
}

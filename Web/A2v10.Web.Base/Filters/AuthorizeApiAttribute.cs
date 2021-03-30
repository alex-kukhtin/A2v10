// Copyright © 2021 Alex Kukhtin. All rights reserved.


using System;
using System.Web;
using System.Web.Mvc;

namespace A2v10.Web.Base
{
	[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = true, Inherited = true)]
	public sealed class AuthorizeApiAttribute : AuthorizeAttribute, IAuthorizationFilter
	{
		protected override bool AuthorizeCore(HttpContextBase httpContext)
		{
			if (!base.AuthorizeCore(httpContext))
				return false;
			return true;
		}

		protected override void HandleUnauthorizedRequest(AuthorizationContext filterContext)
		{
			filterContext.HttpContext.Response.SuppressFormsAuthenticationRedirect = true;
			filterContext.Result = new HttpUnauthorizedResult();
		}
	}
}

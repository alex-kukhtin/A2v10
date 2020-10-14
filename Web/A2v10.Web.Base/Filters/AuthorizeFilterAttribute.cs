// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

using System;
using System.Web.Mvc;

namespace A2v10.Web.Base
{
	[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = false, Inherited = true)]
	public sealed class AuthorizeFilterAttribute : AuthorizeAttribute
	{
		protected override void HandleUnauthorizedRequest(AuthorizationContext filterContext)
		{
			if (filterContext.HttpContext.Request.HttpMethod == "POST")
			{
				filterContext.Result = new HttpStatusCodeResult(473, "Unauthorized");
			}
			else
			{
				base.HandleUnauthorizedRequest(filterContext);
			}
		}
	}
}

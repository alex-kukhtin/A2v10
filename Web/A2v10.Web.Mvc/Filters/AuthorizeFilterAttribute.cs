// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Web.Mvc;

namespace A2v10.Web.Mvc.Filters
{
	public class AuthorizeFilterAttribute : AuthorizeAttribute
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

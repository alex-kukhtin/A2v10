// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using System;
using System.Reflection;
using System.Web.Mvc;

namespace A2v10.Web.Mvc.Filters
{
	public class IsAjaxOnlyAttribute : ActionMethodSelectorAttribute
	{
		public override Boolean IsValidForRequest(ControllerContext controllerContext, MethodInfo methodInfo)
		{
			return controllerContext.HttpContext.Request.IsAjaxRequest();
		}
	}
}

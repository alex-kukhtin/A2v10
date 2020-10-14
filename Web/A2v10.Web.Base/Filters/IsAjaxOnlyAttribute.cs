// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

using System;
using System.Reflection;
using System.Web.Mvc;

namespace A2v10.Web.Base
{
	[AttributeUsage(AttributeTargets.Method, AllowMultiple = false, Inherited = true)]
	public sealed class IsAjaxOnlyAttribute : ActionMethodSelectorAttribute
	{
		public override Boolean IsValidForRequest(ControllerContext controllerContext, MethodInfo methodInfo)
		{
			return controllerContext.HttpContext.Request.IsAjaxRequest();
		}
	}
}

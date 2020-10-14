// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

using System;
using System.Web.Mvc;
using A2v10.Infrastructure;

namespace A2v10.Web.Base
{
	[AttributeUsage(AttributeTargets.Class, AllowMultiple = false, Inherited = true)]
	public sealed class CheckMobileFilterAttribute : ActionFilterAttribute
	{
		public override void OnActionExecuting(ActionExecutingContext filterContext)
		{
			base.OnActionExecuting(filterContext);
			var rqUrl = filterContext.RequestContext.HttpContext.Request.Url;
			if (rqUrl != null)
			{
				ServiceLocator.Current.GetService<IApplicationHost>().CheckIsMobile(rqUrl.Host);
			}
		}
	}
}

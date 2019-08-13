// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using System;
using System.Web.Mvc;
using A2v10.Infrastructure;

namespace A2v10.Web.Mvc.Filters
{
	public class CheckMobileFilterAttribute : ActionFilterAttribute
	{
		public override void OnActionExecuting(ActionExecutingContext filterContext)
		{
			base.OnActionExecuting(filterContext);
			var rqUrl = filterContext.RequestContext.HttpContext.Request.Url;
			Boolean bMobile = false;
			if (rqUrl != null)
				bMobile = rqUrl.Host.StartsWith("m.");
			var serviceLocator = ServiceLocator.Current;
			serviceLocator.GetService<IApplicationHost>().Mobile = bMobile;
		}
	}
}

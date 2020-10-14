// Copyright © 2020 Alex Kukhtin. All rights reserved.

using System;
using System.Web.Mvc;

namespace A2v10.Web.Base
{
	[AttributeUsage(AttributeTargets.Class, AllowMultiple = false, Inherited = true)]
	public sealed class SetReferralAttribute : ActionFilterAttribute
	{
		public override void OnActionExecuting(ActionExecutingContext filterContext)
		{
			base.OnActionExecuting(filterContext);
			var qs = filterContext.RequestContext.HttpContext.Request.QueryString;
			if (qs == null)
				return;
			var refr = qs["ref"];
			if (refr == null)
				return;
			filterContext.RequestContext.HttpContext.Session["Referral"] = refr;
		}
	}
}

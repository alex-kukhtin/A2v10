using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Web.Mvc;

namespace A2v10.Web.Mvc.Filters
{
	public class HttpOptionsAttribute : ActionMethodSelectorAttribute
	{
		public override Boolean IsValidForRequest(ControllerContext controllerContext, MethodInfo methodInfo)
		{
			return controllerContext.HttpContext.Request.HttpMethod == "OPTIONS";
		}
	}
}

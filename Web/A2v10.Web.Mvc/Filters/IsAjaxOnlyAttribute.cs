using System.Reflection;
using System.Web.Mvc;

namespace A2v10.Web.Mvc.Filters
{
    public class IsAjaxOnlyAttribute : ActionMethodSelectorAttribute
    {
        public override bool IsValidForRequest(ControllerContext controllerContext, MethodInfo methodInfo)
        {
            return controllerContext.HttpContext.Request.IsAjaxRequest();
        }
    }
}

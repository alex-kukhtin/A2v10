using System;
using System.Threading.Tasks;
using System.Web.Mvc;

using A2v10.Infrastructure;
using A2v10.Web.Mvc.Filters;
using A2v10.Web.Mvc.Models;

namespace A2v10.Web.Mvc.Controllers
{
    [Authorize]
    public class ElementController : BaseController
    {
        public ElementController(IApplicationHost host, IDbContext dbContext, IRenderer renderer)
            : base(host, dbContext, renderer)
        {
        }

        [IsAjaxOnly]
        public async Task Dialog(String pathInfo)
        {
            await RenderElementKind(RequestUrlKind.Dialog, pathInfo);
        }

        [IsAjaxOnly]
        public ActionResult Invoke(String pathInfo)
        {
            return new EmptyResult();
        }
    }
}

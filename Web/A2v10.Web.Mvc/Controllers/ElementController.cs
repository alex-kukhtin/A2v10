using A2v10.Infrastructure;
using A2v10.Web.Mvc.Filters;
using A2v10.Web.Mvc.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Mvc;

namespace A2v10.Web.Mvc.Controllers
{
    [Authorize]
    public class ElementController : BaseController
    {
        public ElementController(IDbContext dbContext)
            : base(dbContext)
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

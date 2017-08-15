using System;
using System.Web.Mvc;
using System.Threading.Tasks;

using A2v10.Infrastructure;
using A2v10.Web.Mvc.Filters;
using A2v10.Web.Mvc.Models;

namespace A2v10.Web.Mvc.Controllers
{
    [Authorize]
	public class ShellController : BaseController
	{
        public ShellController(IApplicationHost host, IDbContext dbContext, IRenderer renderer)
            : base(host, dbContext, renderer)
        {
        }

        public ActionResult Index()
        {
            return File("~/pages/layout.html", "text/html");
        }

        [IsAjaxOnly]
        public async Task Page(String pathInfo)
        {
            await RenderElementKind(RequestUrlKind.Page, pathInfo);
        }
	}
}

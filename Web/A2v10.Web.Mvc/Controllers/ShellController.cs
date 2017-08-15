using System;
using System.Web.Mvc;
using A2v10.Infrastructure;
using A2v10.Web.Mvc.Models;
using System.Threading.Tasks;
using A2v10.Web.Mvc.Filters;

/**
 * TODO: Use IConfiguration
 */
namespace A2v10.Web.Mvc.Controllers
{
    [Authorize]
	public class ShellController : BaseController
	{
        public ShellController(IDbContext dbContext)
            : base(dbContext)
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

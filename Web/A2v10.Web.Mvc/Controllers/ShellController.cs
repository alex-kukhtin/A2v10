using System;
using System.Web.Mvc;
using A2v10.Infrastructure;

namespace A2v10.Web.Mvc.Controllers
{
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

        public ActionResult Page(String pathInfo)
        {
            String[] route = pathInfo.Split('/');
            if (pathInfo == "catalog/customers")
                return File("~/pages/catalog_customers.html", "text/html");
            return Content($"<div>{pathInfo}</div>", "text/html");
        }
	}
}

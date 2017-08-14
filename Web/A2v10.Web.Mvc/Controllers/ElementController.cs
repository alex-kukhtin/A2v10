using A2v10.Infrastructure;
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

        public ActionResult Dialog(String pathInfo)
        {
            return new EmptyResult();
        }

        public ActionResult Invoke(String pathInfo)
        {
            return new EmptyResult();
        }
    }
}

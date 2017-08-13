using A2v10.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Mvc;

namespace A2v10.Web.Mvc.Controllers
{
    public class BaseController : Controller
    {
        protected IDbContext _dbContext;

        public BaseController(IDbContext dbContext)
        {
            _dbContext = dbContext;
        }
    }
}

using A2v10.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace A2v10.Web.Site.Controllers
{
    [AllowAnonymous]
    public class TestController : Controller
    {
        // GET: Test
        public ActionResult Index(Int64 id)
        {
            //return Content($"I am the text from controller id = {id}", MimeTypes.Text.Plain);
            return View();
        }
    }
}
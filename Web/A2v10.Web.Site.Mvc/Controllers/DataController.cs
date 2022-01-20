using System;
using System.Threading.Tasks;
using System.Web.Mvc;

namespace A2v10.Web.Site.Mvc.Controllers
{
    public class DataController : Controller
    {
        private readonly A2v10.Request.SiteController _siteController;

        public Int64 UserId => 99;

        public DataController()
        {
            _siteController = new A2v10.Request.SiteController()
            {
                UserId = () => UserId
            };
        }
        [HttpPost]
        public async Task Invoke()
        {

            await TryCatch(() => _siteController.Data("invoke", Request, Response));
        }

        private async Task TryCatch(Func<Task> action)
        {
            try
            {
                await action();
            }
            catch (Exception ex)
            {
                _siteController.WriteExceptionStatus(ex, Response);
            }
        }
    }
}
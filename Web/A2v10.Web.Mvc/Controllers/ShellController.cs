using System;
using System.Web.Mvc;
using System.Threading.Tasks;

using A2v10.Infrastructure;
using A2v10.Web.Mvc.Filters;
using A2v10.Web.Mvc.Models;
using System.Dynamic;
using System.Text;
using System.Web;
using A2v10.Web.Mvc.Configuration;

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

        [AllowAnonymous]
        [HttpGet]
        public async Task ShellScript()
        {
            Response.ContentEncoding = Encoding.UTF8;
            Response.HeaderEncoding = Encoding.UTF8;
            Response.ContentType = "application/javascript";
            try
            {
                ExpandoObject loadPrms = new ExpandoObject();
                loadPrms.Set("UserId", UserId);

                String version = AppInfo.MainAssembly.Version;
                //IDataModel dm = await _dbContext.LoadModelAsync(String.Empty, "[a2ui].[Menu.Load]", loadPrms);
                String shellText = System.IO.File.ReadAllText(Server.MapPath("~/pages/shell.js"));

                Response.Write(shellText.Replace("$(AppVersion)", version));
            }
            catch (Exception ex)
            {
                if (ex.InnerException != null)
                    ex = ex.InnerException;
                Response.Write($"alert('{ex.Message.EncodeJs()}')");
            }
        }
	}
}

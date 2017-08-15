using A2v10.Infrastructure;
using A2v10.Web.Mvc.Models;
using Microsoft.AspNet.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Mvc;

namespace A2v10.Web.Mvc.Controllers
{
    [Authorize]
    public class BaseController : Controller
    {
        protected IDbContext _dbContext;


        public Int64 UserId
        {
            get
            {
                return User.Identity.GetUserId<Int64>();
            }
        }

        public BaseController(IDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        protected async Task RenderElementKind(RequestUrlKind kind, String pathInfo)
        {
            Response.ContentType = "text/html";
            Response.ContentEncoding = Encoding.UTF8;
            try
            {
                // TODO: use IConfiguration for appKey
                RequestModel rm = await RequestModel.CreateFromUrl("Demo", kind, pathInfo);
                RequestView rw = rm.CurrentAction as RequestView;
                String content = await Render(rw);
            }
            catch (Exception ex)
            {
                Response.Output.Write($"$<div>{ex.Message}</div>");
            }
        }

        protected async Task<String> Render(RequestView rw)
        {
            String viewName = rw.GetView();
            String loadProc = rw.LoadProcedure;
            IDataModel model;
            if (loadProc != null)
            {
                //TODO: // use model ID
                model = await _dbContext.LoadModelAsync(loadProc, new
                {
                    UserId = UserId
                });
            }
            return String.Empty;
        }
    }
}

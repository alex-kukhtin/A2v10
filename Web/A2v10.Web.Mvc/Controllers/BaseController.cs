using A2v10.Infrastructure;
using A2v10.Web.Mvc.Models;
using Microsoft.AspNet.Identity;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace A2v10.Web.Mvc.Controllers
{
    [Authorize]
    public class BaseController : Controller
    {
        protected IApplicationHost _host;
        protected IDbContext _dbContext;
        protected IRenderer _renderer;

        public Int64 UserId
        {
            get
            {
                return User.Identity.GetUserId<Int64>();
            }
        }

        public BaseController(IApplicationHost host, IDbContext dbContext, IRenderer renderer)
        {
            _host = host;
            _dbContext = dbContext;
            _renderer = renderer;
        }

        protected async Task RenderElementKind(RequestUrlKind kind, String pathInfo)
        {
            Response.ContentType = "text/html";
            Response.ContentEncoding = Encoding.UTF8;
            try
            {
                RequestModel rm = await RequestModel.CreateFromUrl(_host, kind, pathInfo);
                RequestView rw = rm.CurrentAction as RequestView;
                await Render(rw);
            }
            catch (Exception ex)
            {
                WriteException(ex);
            }
        }

        void WriteException(Exception ex)
        {
            if (ex.InnerException != null)
                ex = ex.InnerException;
            var msg = Server.HtmlEncode(ex.Message);
            Response.Output.Write($"$<div class=\"app-exception\"><div class=\"message\">{msg}</div></div>");
        }

        protected async Task Render(RequestView rw)
        {
            String viewName = rw.GetView();
            String loadProc = rw.LoadProcedure;
            IDataModel model = null;
            if (loadProc != null)
            {
                //TODO: // use model ID
                model = await _dbContext.LoadModelAsync(loadProc, new
                {
                    UserId = UserId
                });
            }
            // try HTML
            String rootId = "el" + Guid.NewGuid().ToString();
            String fileName = _host.MakeFullPath(rw.Path, rw.GetView() + ".html");
            bool bRendered = false;
            if (System.IO.File.Exists(fileName)) {
                using (var tr = new StreamReader(fileName))
                {
                    String htmlText = await tr.ReadToEndAsync();
                    htmlText = htmlText.Replace("$(RootId)", rootId);
                    Response.Output.Write(htmlText);
                    bRendered = true;
                }
            } else {
                // render XAML
                fileName = _host.MakeFullPath(rw.Path, rw.GetView() + ".xaml");
                if (System.IO.File.Exists(fileName))
                {
                    using (var strWriter = new StringWriter())
                    {
                        var ri = new RenderInfo()
                        {
                            RootId = rootId,
                            FileName = fileName,
                            Writer = strWriter
                        };
                        _renderer.Render(ri);
                        // write markup
                        Response.Output.Write(strWriter.ToString());
                        bRendered = true;
                    }
                }
            }
            if (!bRendered) {
                throw new RequestModelException($"The view '{rw.GetView()}' was not found. The following locations were searched:\n{rw.GetRelativePath(".html")}\n{rw.GetRelativePath(".xaml")}");
            }
            await WriteModelScript(rw, model, rootId);
        }


        async Task WriteModelScript(RequestView rw, IDataModel model, String rootId)
        {
            String dataModelText = "null";
            if (model != null)
            {
                // write model script
                String templateText = null;
                if (rw.template != null)
                {
                    templateText = await _host.ReadTextFile(rw.Path, rw.template + ".js");
                }
                var jss = new JsonSerializerSettings()
                {
                    Formatting = Formatting.Indented,
                    StringEscapeHandling = StringEscapeHandling.EscapeHtml,
                    DateFormatHandling = DateFormatHandling.IsoDateFormat,
                    DateTimeZoneHandling = DateTimeZoneHandling.Utc,
                    NullValueHandling = NullValueHandling.Ignore
                };
                dataModelText = JsonConvert.SerializeObject(model.Root, jss);
            }

                //Response.Output.Write(model.GetModelScript(rootId, templateFile));
                const String script =
@"
<script type=""text/javascript"">
(function() {

    function getModelData() {
        return $(DataModelText);
    };

    new Vue({
        el:'#$(RootId)',
        data: getModelData()
    });
})();
</script>
";
            var sb = new StringBuilder(script);
            sb.Replace("$(RootId)", rootId);
            sb.Replace("$(DataModelText)", dataModelText);
            Response.Output.Write(sb.ToString());
        }
    }
}

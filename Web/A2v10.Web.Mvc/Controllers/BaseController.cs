using A2v10.Infrastructure;
using A2v10.Web.Mvc.Models;
using Microsoft.AspNet.Identity;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Dynamic;
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
                RequestView rw = rm.GetCurrentAction(kind);
                await Render(rw);
            }
            catch (Exception ex)
            {
                WriteHtmlException(ex);
            }
        }

        void WriteHtmlException(Exception ex)
        {
            if (ex.InnerException != null)
                ex = ex.InnerException;
            var msg = Server.HtmlEncode(ex.Message);
            var stackTrace = Server.HtmlEncode(ex.StackTrace);
            // TODO: debug / release without stack trace
            if (_host.IsDebugConfiguration)
                Response.Output.Write($"$<div class=\"app-exception\"><div class=\"message\">{msg}</div><div class=\"stack-trace\">{stackTrace}</div></div>");
            else
                Response.Output.Write($"$<div class=\"app-exception\"><div class=\"message\">{msg}</div></div>");
        }

        protected void WriteExceptionStatus(Exception ex)
        {
            if (ex.InnerException != null)
                ex = ex.InnerException;
            Response.ContentEncoding = Encoding.UTF8;
            Response.HeaderEncoding = Encoding.UTF8;
            Response.SuppressContent = false;
            Response.StatusCode = 255; // CUSTOM ERROR!!!!
            Response.ContentType = "text/plain";
            Response.StatusDescription = "Custom server error";
            Response.Write(ex.Message);
        }

        protected async Task Render(RequestView rw)
        {
            String viewName = rw.GetView();
            String loadProc = rw.LoadProcedure;
            IDataModel model = null;
            if (loadProc != null)
            {
                ExpandoObject loadPrms = new ExpandoObject();
                loadPrms.Append(Request.QueryString, toPascalCase: true);
                loadPrms.Set("UserId", UserId);
                loadPrms.Set("Id", rw.Id);
                model = await _dbContext.LoadModelAsync(rw.CurrentSource, loadProc, loadPrms);
            }
            String rootId = "el" + Guid.NewGuid().ToString();

            String modelScript = await WriteModelScript(rw, model, rootId);

            // TODO: use view engines
            // try xaml
            String fileName = _host.MakeFullPath(rw.Path, rw.GetView() + ".xaml");
            bool bRendered = false;
            if (System.IO.File.Exists(fileName)) {
                // render XAML
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
            } else {
                // try html
                fileName = _host.MakeFullPath(rw.Path, rw.GetView() + ".html");
                if (System.IO.File.Exists(fileName)) {
                    using (var tr = new StreamReader(fileName))
                    {
                        String htmlText = await tr.ReadToEndAsync();
                        htmlText = htmlText.Replace("$(RootId)", rootId);
                        Response.Output.Write(htmlText);
                        bRendered = true;
                    }
                }
            }
            if (!bRendered) {
                throw new RequestModelException($"The view '{rw.GetView()}' was not found. The following locations were searched:\n{rw.GetRelativePath(".xaml")}\n{rw.GetRelativePath(".html")}");
            }
            Response.Output.Write(modelScript);
        }


        String CreateTemplateForWrite(String fileTemplateText)
        {
            const String tmlHeader = 
@"(function() {
    let module = { exports: undefined };
    (function(module, exports) {";

            const String tmlFooter =
@"
    })(module, module.exports);
    return module.exports;
})()";
            var sb = new StringBuilder(tmlHeader);
            sb.Append(fileTemplateText);
            sb.Append(tmlFooter);
            return sb.ToString();
    }

        async Task<String> WriteModelScript(RequestView rw, IDataModel model, String rootId)
        {
            StringBuilder output = new StringBuilder();
            String dataModelText = "null";
            String templateText = "{}";
            if (model != null)
            {
                // write model script
                String fileTemplateText = null;
                if (rw.template != null)
                {
                    fileTemplateText = await _host.ReadTextFile(rw.Path, rw.template + ".js");
                    templateText = CreateTemplateForWrite(fileTemplateText);
                }
                dataModelText = JsonConvert.SerializeObject(model.Root, StandardSerializerSettings);
            }

            const String scriptHeader =
@"
<script type=""text/javascript"">
(function() {
    const DataModelController = component('baseController');

    const rawData = $(DataModelText);
    const template = $(TemplateText);
";
            const String scriptFooter =
@"
    const vm = new DataModelController({
        el:'#$(RootId)',
        props: {
            inDialog: {type: Boolean, default: $(IsDialog)} 
        },
        data: modelData(template, rawData)
    });

    vm.$data._host_ = {
        $viewModel: vm
    };

})();
</script>
";
            // TODO: may be data model from XAML ????
            const String emptyModel = "function modelData() {return null;}";

            var header = new StringBuilder(scriptHeader);
            header.Replace("$(RootId)", rootId);
            header.Replace("$(DataModelText)", dataModelText);
            header.Replace("$(TemplateText)", templateText);
            output.Append(header);
            if (model != null)
                output.Append(model.CreateScript());
            else
                output.Append(emptyModel);
            var footer = new StringBuilder(scriptFooter);
            footer.Replace("$(RootId)", rootId);
            footer.Replace("$(IsDialog)", rw.IsDialog.ToString().ToLowerInvariant());
            output.Append(footer);
            return output.ToString();
        }

        public static JsonSerializerSettings StandardSerializerSettings
        {
            get
            {
                return new JsonSerializerSettings()
                {
                    Formatting = Formatting.Indented,
                    StringEscapeHandling = StringEscapeHandling.EscapeHtml,
                    DateFormatHandling = DateFormatHandling.IsoDateFormat,
                    DateTimeZoneHandling = DateTimeZoneHandling.Utc,
                    NullValueHandling = NullValueHandling.Ignore
                };
            }
        }
    }
}

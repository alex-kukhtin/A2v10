using System;
using System.Dynamic;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

using A2v10.Infrastructure;

namespace A2v10.Request
{
    public partial class BaseController
    {
        protected IApplicationHost _host;
        protected IDbContext _dbContext;
        protected IRenderer _renderer;

        public BaseController()
        {
            // DI ready
            IServiceLocator current = ServiceLocator.Current;
            _host = current.GetService<IApplicationHost>();
            _dbContext = current.GetService<IDbContext>();
            _renderer = current.GetService<IRenderer>();
        }

        public Boolean IsDebugConfiguration => _host.IsDebugConfiguration;
        public Boolean Admin { get; set; }

        public async Task RenderElementKind(RequestUrlKind kind, String pathInfo, ExpandoObject loadPrms, TextWriter writer)
        {
            RequestModel rm = await RequestModel.CreateFromUrl(_host, Admin, kind, pathInfo);
            RequestView rw = rm.GetCurrentAction(kind);
            await Render(rw, writer, loadPrms);
        }

        protected async Task Render(RequestView rw, TextWriter writer, ExpandoObject loadPrms)
        {
            String viewName = rw.GetView();
            String loadProc = rw.LoadProcedure;
            IDataModel model = null;
            if (loadProc != null)
            {
                if (loadPrms != null)
                    loadPrms.Set("Id", rw.Id);
                model = await _dbContext.LoadModelAsync(rw.CurrentSource, loadProc, loadPrms);
            }
            String rootId = "el" + Guid.NewGuid().ToString();

            String modelScript = await WriteModelScript(rw, model, rootId);

            // TODO: use view engines
            // try xaml
            String fileName = _host.MakeFullPath(Admin, rw.Path, rw.GetView() + ".xaml");
            bool bRendered = false;
            if (System.IO.File.Exists(fileName))
            {
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
                        writer.Write(strWriter.ToString());
                        bRendered = true;
                    }
                }
            }
            else
            {
                // try html
                fileName = _host.MakeFullPath(Admin, rw.Path, rw.GetView() + ".html");
                if (System.IO.File.Exists(fileName))
                {
                    using (var tr = new StreamReader(fileName))
                    {
                        String htmlText = await tr.ReadToEndAsync();
                        htmlText = htmlText.Replace("$(RootId)", rootId);
                        writer.Write(htmlText);
                        bRendered = true;
                    }
                }
            }
            if (!bRendered)
            {
                throw new RequestModelException($"The view '{rw.GetView()}' was not found. The following locations were searched:\n{rw.GetRelativePath(".xaml")}\n{rw.GetRelativePath(".html")}");
            }
            writer.Write(modelScript);
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
                    fileTemplateText = await _host.ReadTextFile(Admin, rw.Path, rw.template + ".js");
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
            inDialog: {type: Boolean, default: $(IsDialog)},
            pageTitle: {type: String}
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

        String CreateTemplateForWrite(String fileTemplateText)
        {
            const String tmlHeader =
@"(function() {
    let module = { exports: undefined };
    (function(module, exports) {
    'use strict';";

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

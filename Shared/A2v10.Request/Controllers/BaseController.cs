// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

using A2v10.Infrastructure;
using System.Collections.Generic;
using A2v10.Infrastructure.Utilities;
using System.Net;

namespace A2v10.Request
{
    public partial class BaseController
    {
        protected IApplicationHost _host;
        protected IDbContext _dbContext;
        protected IRenderer _renderer;
        protected IWorkflowEngine _workflowEngine;

        public BaseController()
        {
            // DI ready
            IServiceLocator current = ServiceLocator.Current;
            _host = current.GetService<IApplicationHost>();
            _dbContext = current.GetService<IDbContext>();
            _renderer = current.GetService<IRenderer>();
            _workflowEngine = current.GetService<IWorkflowEngine>();
        }

        public Boolean IsDebugConfiguration => _host.IsDebugConfiguration;
        public IDbContext DbContext => _dbContext;
        public IApplicationHost Host => _host;
        public Boolean Admin { get; set; }

        public async Task RenderElementKind(RequestUrlKind kind, String pathInfo, ExpandoObject loadPrms, TextWriter writer)
        {
            RequestModel rm = await RequestModel.CreateFromUrl(_host, Admin, kind, pathInfo);
            RequestView rw = rm.GetCurrentAction(kind);
            await Render(rw, writer, loadPrms);
        }

        async Task<RequestView> LoadIndirect(RequestView rw, IDataModel innerModel, ExpandoObject loadPrms, ExpandoObject queryParams)
        {
            if (!rw.indirect)
                return rw;
            if (!String.IsNullOrEmpty(rw.target))
            {
                String targetUrl = innerModel.Root.Resolve(rw.target);
                if (String.IsNullOrEmpty(rw.targetId))
                    throw new RequestModelException("targetId must be specified for indirect action");
                targetUrl += "/" + innerModel.Root.Resolve(rw.targetId);
                var rm = await RequestModel.CreateFromUrl(_host, Admin, rw.CurrentKind, targetUrl);
                rw = rm.GetCurrentAction();
                String loadProc = rw.LoadProcedure;
                if (loadProc != null)
                {
                    loadPrms = DynamicHelpers.Merge(loadPrms, queryParams);
                    loadPrms.Set("Id", rw.Id);
                    var newModel = await _dbContext.LoadModelAsync(rw.CurrentSource, loadProc, loadPrms);
                    innerModel.Merge(newModel);
                    innerModel.System.Set("__indirectUrl__", rm.BaseUrl);
                }
            }
            else
            {
                // simple view/model redirect
                if (rw.targetModel == null)
                {
                    throw new RequestModelException("'targetModel' must be specified for indirect action without 'target' property");

                }
                rw.model = innerModel.Root.Resolve(rw.targetModel.model);
                rw.view = innerModel.Root.Resolve(rw.targetModel.view);
                rw.schema = innerModel.Root.Resolve(rw.targetModel.schema);
                if (String.IsNullOrEmpty(rw.schema))
                    rw.schema = null;
                rw.template = innerModel.Root.Resolve(rw.targetModel.template);
                if (String.IsNullOrEmpty(rw.template))
                    rw.template = null;
                String loadProc = rw.LoadProcedure;
                if (loadProc != null)
                {
                    loadPrms = DynamicHelpers.Merge(loadPrms, queryParams);
                    loadPrms.Set("Id", rw.Id);
                    var newModel = await _dbContext.LoadModelAsync(rw.CurrentSource, loadProc, loadPrms);
                    innerModel.Merge(newModel);
                }
            }
            return rw;
        }

        protected async Task Render(RequestView rw, TextWriter writer, ExpandoObject loadPrms)
        {
            String loadProc = rw.LoadProcedure;
            IDataModel model = null;
            if (loadProc != null)
            {
                if (loadPrms != null)
                    loadPrms.Set("Id", rw.Id);
                model = await _dbContext.LoadModelAsync(rw.CurrentSource, loadProc, loadPrms);
            }
            if (rw.indirect)
                rw = await LoadIndirect(rw, model, loadPrms, null);

            String viewName = rw.GetView();
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
                            Writer = strWriter,
                            DataModel = model
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
            StringBuilder sbRequired = new StringBuilder();
            if (model != null)
            {
                // write model script
                String fileTemplateText = null;
                if (rw.template != null)
                {
                    fileTemplateText = await _host.ReadTextFile(Admin, rw.Path, rw.template + ".js");
                    AddRequiredModules(sbRequired, fileTemplateText);
                    templateText = CreateTemplateForWrite(fileTemplateText);
                }
                dataModelText = JsonConvert.SerializeObject(model.Root, StandardSerializerSettings);
            }


            const String scriptHeader =
@"
<script type=""text/javascript"">

'use strict';

$(RequiredModules)

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

    vm.__doInit__();

})();
</script>
";
            // TODO: may be data model from XAML ????
            const String emptyModel = "function modelData() {return null;}";
    
            var header = new StringBuilder(scriptHeader);
            header.Replace("$(RootId)", rootId);
            header.Replace("$(DataModelText)", dataModelText);
            header.Replace("$(TemplateText)", templateText);
            header.Replace("$(RequiredModules)", sbRequired != null ? sbRequired.ToString() : String.Empty);
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
";

            const String tmlFooter =
    @"
    })(module, module.exports);
    return module.exports;
})()";

            var sb = new StringBuilder();

            sb.AppendLine()
            .AppendLine(tmlHeader)
            .AppendLine(fileTemplateText)
            .AppendLine(tmlFooter);
            return sb.ToString();
        }

        HashSet<String> _modulesWritten;

        void AddRequiredModules(StringBuilder sb, String clientScript)
        {
            const String tmlHeader =
@"
    app.modules['$(Module)'] = function() {
    let module = { exports: undefined };
    (function(module, exports) {
";

            const String tmlFooter =
@"
    })(module, module.exports);
    return module.exports;
};";

            if (String.IsNullOrEmpty(clientScript))
                return;
            if (_modulesWritten == null)
                _modulesWritten = new HashSet<String>();
            int iIndex = 0;
            while (true)
            {
                String moduleName = FindModuleNameFromString(clientScript, ref iIndex);
                if (moduleName == null)
                    return; // not found
                if (String.IsNullOrEmpty(moduleName))
                    continue;
                if (moduleName.ToLowerInvariant().StartsWith("global/"))
                    continue;
                if (moduleName.ToLowerInvariant().StartsWith("std:"))
                    continue;
                if (_modulesWritten.Contains(moduleName))
                    continue;
                var fileName = Path.ChangeExtension(moduleName, "js");
                var filePath = Path.GetFullPath(Path.Combine(_host.AppPath, _host.AppKey, fileName));
                if (!File.Exists(filePath))
                    throw new FileNotFoundException(filePath);
                String moduleText = File.ReadAllText(filePath);
                sb.AppendLine(tmlHeader.Replace("$(Module)", moduleName))
                    .AppendLine(moduleText)
                    .AppendLine(tmlFooter)
                    .AppendLine();
                _modulesWritten.Add(moduleName);
                AddRequiredModules(sb, moduleText);
            }
        }

        public static String FindModuleNameFromString(String text, ref int pos)
        {
            String funcName = "require";
            int rPos = text.IndexOf(funcName, pos);
            if (rPos == -1)
                return null; // не продолжаем, ничего не нашли
            pos = rPos + funcName.Length;
            // проверим, что мы не в комментарии
            int oc = text.LastIndexOf("/*", rPos);
            int cc = text.LastIndexOf("*/", rPos);
            if (oc != -1)
            {
                // есть открывающий комментарий
                if (cc == -1)
                {
                    return String.Empty; // нет закрывающего
                }
                if (cc < oc)
                {
                    return String.Empty; // закрывающий левее открывающего, мы внутри
                }
            }
            int startLine = text.LastIndexOfAny(new Char[] { '\r', '\n' }, rPos);
            oc = text.LastIndexOf("//", rPos);
            if ((oc != 1) && (oc > startLine))
                return String.Empty; // есть однострочный и он после начала строки

            Tokenizer tokenizer = null;
            try
            {
                // проверим точку, как предыдущий токен
                var dotPos = text.LastIndexOf('.', rPos);
                if (dotPos != -1)
                {
                    tokenizer = new Tokenizer(text, dotPos);
                    if (tokenizer.token.id == Tokenizer.TokenId.Dot)
                    {
                        tokenizer.NextToken();
                        var tok = tokenizer.token;
                        if (tok.id == Tokenizer.TokenId.Identifier && tok.Text == "require")
                        {
                            tokenizer.NextToken();
                            if (tokenizer.token.id == Tokenizer.TokenId.OpenParen)
                                return String.Empty; /* есть точка перед require */
                        }
                    }
                }
                tokenizer = new Tokenizer(text, rPos + funcName.Length);
                if (tokenizer.token.id == Tokenizer.TokenId.OpenParen)
                {
                    tokenizer.NextToken();
                    if (tokenizer.token.id == Tokenizer.TokenId.StringLiteral)
                    {
                        pos = tokenizer.GetTextPos();
                        return tokenizer.token.UnquotedText.Replace("\\\\", "/");
                    }
                }
                pos = tokenizer.GetTextPos();
                return String.Empty;
            }
            catch (Exception /*ex*/)
            {
                // parser error
                if (tokenizer != null)
                    pos = tokenizer.GetTextPos();
                return null;
            }
        }

        public static readonly JsonSerializerSettings StandardSerializerSettings = 
            new JsonSerializerSettings() {
                    Formatting = Formatting.Indented,
                    StringEscapeHandling = StringEscapeHandling.EscapeHtml,
                    DateFormatHandling = DateFormatHandling.IsoDateFormat,                    
                    DateTimeZoneHandling = DateTimeZoneHandling.Utc,
                    NullValueHandling = NullValueHandling.Ignore,
                    DefaultValueHandling = DefaultValueHandling.Ignore
                };

        public void WriteHtmlException(Exception ex, TextWriter writer)
        {
            if (ex.InnerException != null)
                ex = ex.InnerException;
            var msg = WebUtility.HtmlEncode(ex.Message);
            var stackTrace = WebUtility.HtmlEncode(ex.StackTrace);
            if (IsDebugConfiguration)
                writer.Write($"<div class=\"app-exception\"><div class=\"message\">{msg}</div><div class=\"stack-trace\">{stackTrace}</div></div>");
            else
                writer.Write($"<div class=\"app-exception\"><div class=\"message\">{msg}</div></div>");
        }
    }
}

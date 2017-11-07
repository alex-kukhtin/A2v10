// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Newtonsoft.Json;
using A2v10.Infrastructure;
using System.Dynamic;
using System.Text.RegularExpressions;

namespace A2v10.Request
{
    public class RequestModelException : Exception
    {
        public RequestModelException(String message)
            : base(message)
        {

        }
    }

    public enum RequestUrlKind
    {
        Page,
        Dialog,
        Popup,
        Command,
        Data,
        Image,
        Report
    }

    public enum RequestDataAction
    {
        Save
    }

    public struct RequestModelInfo
    {
        public String id;
        public String action;
        public String dialog;
        public String popup;
        public String command;
        public String path;
        public String data;
        public String report;
    }


    public class RequestBase
    {
        public String model; // or parent
        public String schema; // or parent
        public String source; // or parent
        public Boolean index;

        public String template;

        [JsonIgnore]
        protected RequestModel _parent;

        internal void SetParent(RequestModel model)
        {
            _parent = model;
        }

        [JsonIgnore]
        public String Path
        {
            get
            {
                return _parent._modelPath;
            }
        }

        [JsonIgnore]
        public String Id
        {
            get
            {
                return _parent._id;
            }
        }

        [JsonIgnore]
        public String LoadProcedure
        {
            get
            {
                var cm = CurrentModel;
                if (String.IsNullOrEmpty(cm))
                    return null;
                String action = index ? "Index" : "Load";
                return $"[{CurrentSchema}].[{cm}.{action}]";
            }
        }

        [JsonIgnore]
        public String DeleteProcedure
        {
            get
            {
                var cm = CurrentModel;
                if (String.IsNullOrEmpty(cm))
                    return null;
                return $"[{CurrentSchema}].[{cm}.Delete]";
            }
        }

        [JsonIgnore]
        public String ExpandProcedure
        {
            get
            {
                var cm = CurrentModel;
                if (String.IsNullOrEmpty(cm))
                    return null;
                return $"[{CurrentSchema}].[{cm}.Expand]";
            }
        }

        [JsonIgnore]
        public String UpdateProcedure
        {
            get
            {
                if (index)
                    throw new RequestModelException($"Could not update index model '{CurrentModel}'");
                var cm = CurrentModel;
                if (String.IsNullOrEmpty(cm))
                    return null;
                return $"[{CurrentSchema}].[{cm}.Update]";
            }
        }

        [JsonIgnore]
        public String CurrentSchema
        {
            get
            {
                if (_parent == null)
                    throw new ArgumentNullException(nameof(_parent));
                if (schema == null)
                    return _parent.schema;
                return schema;
            }
        }

        [JsonIgnore]
        public String CurrentSource
        {
            get
            {
                if (_parent == null)
                    throw new ArgumentNullException(nameof(_parent));
                if (schema == null)
                    return _parent.source;
                return source;
            }
        }

        [JsonIgnore]
        public String CurrentModel
        {
            get
            {
                if (_parent == null)
                    throw new ArgumentNullException(nameof(_parent));
                if (model == null)
                    return _parent.model;
                return model;
            }
        }
    }

    public abstract class RequestView : RequestBase
    {
        public String view;
        public String hook;
        public Boolean indirect;
        public String target;
        public String targetId;

        public String GetView()
        {
            return view;
        }

        public RequestUrlKind CurrentKind => _parent.CurrentKind;

        public virtual Boolean IsDialog { get { return false; } }

        public String GetRelativePath(String extension)
        {
            return $"~/{Path}/{GetView()}{extension}";
        }

        public IModelHandler GetHookHandler(IApplicationHost host)
        {
            if (String.IsNullOrEmpty(hook))
                return null;
            var regex = new Regex(@"^\s*clr-type\s*:\s*([\w\.]+)\s*;\s*assembly\s*=\s*([\w\.]+)\s*$");
            var match = regex.Match(hook);
            if (match.Groups.Count != 3)
            {
                String errorMsg = $"Invalid hook definition: '{hook}'. Expected: 'clr-type:TypeName;assembly=AssemblyName'";
                throw new RequestModelException(errorMsg);
            }
            String assemblyName = match.Groups[2].Value;
            String typeName = match.Groups[1].Value;
            var modelHandler = System.Activator.CreateInstance(assemblyName:assemblyName, typeName:typeName, 
                ignoreCase: false, bindingAttr: 0, 
                binder: null, args:new Object[] { host }, 
                culture: null, 
                activationAttributes: null).Unwrap();
            if (!(modelHandler is IModelHandler))
                throw new RequestModelException($"{typeName} must implement interface IModelHandler");
            return modelHandler as IModelHandler;
        }
    }

    public class RequestAction : RequestView
    {
    }

    public class RequestDialog : RequestView
    {
        public override Boolean IsDialog { get { return true; } }
    }

    public class RequestPopup : RequestView
    {
    }

    public enum CommandType
    {
        none,
        sql,
        startProcess,
        resumeProcess
    }

    public class RequestCommand : RequestBase
    {
        public String command;
        public CommandType type;
        public String procedure;
        public String file;

        [JsonIgnore]
        public String CommandProcedure => $"[{CurrentSchema}].[{procedure}]";

        [JsonIgnore]
        public String ActionBase
        {
            get
            {
                return _parent._modelPath;
            }
        }
    }

    public class RequestReport : RequestBase
    {
        public String report;
        public String procedure;

        public ExpandoObject variables;

        [JsonIgnore]
        public String ReportName => report;

        [JsonIgnore]
        public String ReportProcedure
        {
            get
            {
                var cm = CurrentModel;
                if (String.IsNullOrEmpty(cm))
                    return null;
                return $"[{CurrentSchema}].[{cm}.Report]";
            }
        }
    }

    public class RequestImage : RequestBase
    {
        public String key;
    }

    public class RequestModel
    {
        private String _action;
        private String _dialog;
        private String _popup;
        private String _command;
        private String _report;
        private String _data;
        private RequestUrlKind _kind;

        [JsonIgnore]
        internal String _modelPath;
        [JsonIgnore]
        internal String _id;

        public String model; // data model
        public String schema; // schema for data model
        public String source; // connection string for data model

        [JsonIgnore]
        internal RequestUrlKind CurrentKind => _kind;

        public Dictionary<String, RequestAction> actions { get; set; } = new Dictionary<String, RequestAction>(StringComparer.InvariantCultureIgnoreCase);
        public Dictionary<String, RequestDialog> dialogs { get; set; } = new Dictionary<String, RequestDialog>(StringComparer.InvariantCultureIgnoreCase);
        public Dictionary<String, RequestPopup> popups { get; set; } = new Dictionary<String, RequestPopup>(StringComparer.InvariantCultureIgnoreCase);
        public Dictionary<String, RequestCommand> commands { get; set; } = new Dictionary<String, RequestCommand>(StringComparer.InvariantCultureIgnoreCase);
        public Dictionary<String, RequestReport> reports { get; set; } = new Dictionary<String, RequestReport>(StringComparer.InvariantCultureIgnoreCase);


        [JsonIgnore]
        public String ModelAction => _action;

        public RequestDataAction DataAction
        {
            get
            {
                switch (_data.ToLowerInvariant())
                {
                    case "save": return RequestDataAction.Save;
                    default:
                        throw new RequestModelException($"Invalid data action {_data}");
                }
            }
        }

        public String BaseUrl
        {
            get
            {
                String kind = String.Empty;
                switch (_kind)
                {
                    case RequestUrlKind.Page:
                        kind = "_page";
                        break;
                    default:
                        throw new RequestModelException($"Invalid RequestKind '{_kind}' for indirect query");
                }
                return $"/{kind}/{_modelPath}/{_action}/{_id}";
            }
        }

        public RequestAction CurrentAction
        {
            get
            {
                if (actions.Count == 0)
                    throw new RequestModelException($"There are no actions in model '{_modelPath}'");
                if (String.IsNullOrEmpty(_action))
                    throw new RequestModelException($"Invalid empty action in url for model {_modelPath}");
                RequestAction ma;
                if (actions.TryGetValue(_action.ToLowerInvariant(), out ma))
                    return ma;
                throw new RequestModelException($"Action '{_action}' not found in model {_modelPath}");
            }
        }

        public RequestDialog CurrentDialog
        {
            get
            {
                if (dialogs.Count == 0)
                    throw new RequestModelException($"There are no dialogs in model '{_modelPath}'");
                if (String.IsNullOrEmpty(_dialog))
                    throw new RequestModelException($"Invalid empty dialog in url for {_modelPath}");
                RequestDialog da;
                if (dialogs.TryGetValue(_dialog, out da))
                    return da;
                throw new RequestModelException($"Dialog '{_dialog}' not found in model {_modelPath}");
            }
        }

        public RequestPopup CurrentPopup
        {
            get
            {
                if (popups.Count == 0)
                    throw new RequestModelException($"There are no popups in model '{_modelPath}'");
                if (String.IsNullOrEmpty(_popup))
                    throw new RequestModelException($"Invalid empty popup in url for {_modelPath}");
                RequestPopup pa;
                if (popups.TryGetValue(_popup, out pa))
                    return pa;
                throw new RequestModelException($"Popup '{_popup}' not found in model {_modelPath}");
            }
        }

        public RequestCommand CurrentCommand => throw new NotImplementedException();

        public RequestView GetCurrentAction()
        {
            return GetCurrentAction(_kind);
        }

        public RequestView GetCurrentAction(RequestUrlKind kind)
        {
            if (kind == RequestUrlKind.Page)
                return CurrentAction;
            else if (kind == RequestUrlKind.Dialog)
                return CurrentDialog;
            else if (kind == RequestUrlKind.Popup)
                return CurrentPopup;
            throw new RequestModelException($"Invalid kind ({kind}) for GetCurrentAction");
        }

        private void EndInit()
        {
            foreach (var a in actions.Values)
                a.SetParent(this);
            foreach (var c in commands.Values)
                c.SetParent(this);
            foreach (var d in dialogs.Values)
                d.SetParent(this);
            foreach (var p in popups.Values)
                p.SetParent(this);
            foreach (var r in reports.Values)
                r.SetParent(this);
        }

        public RequestCommand GetCommand(String command)
        {
            RequestCommand cmd;
            if (commands.TryGetValue(command, out cmd))
                return cmd;
            throw new RequestModelException($"Command '{command}' not found in model.json");
        }

        public RequestReport GetReport()
        {
            RequestReport rep;
            if (reports.TryGetValue(_report, out rep))
                return rep;
            throw new RequestModelException($"Report '{_report}' not found");
        }

        public static RequestModelInfo GetModelInfo(RequestUrlKind kind, String normalizedUrl)
        {
            // {pathInfo}/action/id - ACTION
            // {pathInfo}/dialog/id - DIALOG
            // {pathInfo}/command/id - COMMAND
            // {pathInfo}/image/id - IMAGE

            var mi = new RequestModelInfo();
            String[] urlParts = normalizedUrl.Split('/');
            Int32 len = urlParts.Length;
            if (len < 3)
            {
                // min: {path}/{act}/id 
                throw new RequestModelException($"invalid url ({normalizedUrl})");
            }
            mi.id = urlParts[len - 1];
            String action = urlParts[len - 2];
            switch (kind) {
                case RequestUrlKind.Page:
                    mi.action = action;
                    break;
                case RequestUrlKind.Dialog:
                    mi.dialog = action;
                    break;
                case RequestUrlKind.Popup:
                    mi.popup = action;
                    break;
                case RequestUrlKind.Command:
                    mi.command = action;
                    break;
                case RequestUrlKind.Data:
                    mi.data = action;
                    break;
                case RequestUrlKind.Image:
                    mi.action = action;
                    break;
                case RequestUrlKind.Report:
                    mi.report = action;
                    break;
                default:
                    throw new RequestModelException($"Invalid action kind ({kind})");
            }
            var pathArr = new ArraySegment<String>(urlParts, 0, len - 2);
            mi.path = String.Join("/", pathArr);
            return mi;
        }

        public static async Task<RequestModel> CreateFromUrl(IApplicationHost host, Boolean bAdmin, RequestUrlKind kind, String normalizedUrl)
        {
            var mi = GetModelInfo(kind, normalizedUrl);
            String jsonText = await host.ReadTextFile(bAdmin, mi.path, "model.json");
            var rm = JsonConvert.DeserializeObject<RequestModel>(jsonText);
            rm.EndInit();
            rm._action = mi.action;
            rm._dialog = mi.dialog;
            rm._popup = mi.popup;
            rm._command = mi.command;
            rm._report = mi.report;
            rm._data = mi.data;
            rm._modelPath = mi.path;
            rm._id = ((mi.id == "0") || (mi.id == "new")) ? null : mi.id;
            return rm;
        }

        public static async Task<RequestModel> CreateFromBaseUrl(IApplicationHost host, Boolean bAdmin, String baseUrl)
        {
            baseUrl = baseUrl.ToLowerInvariant();
            RequestUrlKind kind;
            if (baseUrl.StartsWith("/_dialog"))
            {
                kind = RequestUrlKind.Dialog;
                baseUrl = baseUrl.Substring(9);
            }
            else if (baseUrl.StartsWith("/_page"))
            {
                kind = RequestUrlKind.Page;
                baseUrl = baseUrl.Substring(7);
            }
            else if (baseUrl.StartsWith("/_popup"))
            {
                kind = RequestUrlKind.Popup;
                baseUrl = baseUrl.Substring(8);
            }
            else if (baseUrl.StartsWith("/_image"))
            {
                kind = RequestUrlKind.Image;
                baseUrl = baseUrl.Substring(8);
            }
            else if (baseUrl.StartsWith("/_report"))
            {
                kind = RequestUrlKind.Report;
                baseUrl = baseUrl.Substring(9);
            }
            else
            {
                throw new RequestModelException($"Invalid base url: {baseUrl}");
            }
            var rm = await CreateFromUrl(host, bAdmin, kind, baseUrl);
            rm._kind = kind;
            return rm;
        }
    }
}


using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Newtonsoft.Json;
using A2v10.Infrastructure;

namespace A2v10.Web.Mvc.Models
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
        Data
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
    }


    public class RequestBase
    {
        public String model; // or parent
        public String schema; // or parent
        public String source; // or parent
        public Boolean index;

        public String template;

        [JsonIgnore]
        private RequestModel _parent;

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
        public abstract String GetView();

        public virtual Boolean IsDialog { get { return false; } }

        public String GetRelativePath(String extension)
        {
            return $"~/{Path}/{GetView()}{extension}";
        }
    }

    public class RequestAction : RequestView
    {
        public String view;

        public override string GetView()
        {
            return view;
        }
    }

    public class RequestDialog : RequestView
    {
        public string dialog;

        public override Boolean IsDialog { get { return true; } }

        public override string GetView()
        {
            return dialog;
        }
    }

    public class RequestPopup : RequestView
    {
        public string popup;

        public override string GetView()
        {
            return popup;
        }
    }

    public class RequestCommand : RequestBase
    {
        public String command;
    }

    public class RequestModel
    {
        private String _action;
        private String _dialog;
        private String _popup;
        private String _command;
        private String _data;
        private RequestUrlKind _kind;

        [JsonIgnore]
        internal String _modelPath;
        [JsonIgnore]
        internal String _id;

        public String model; // data model
        public String schema; // schema for data model
        public String source; // connection string for data model

        public Dictionary<String, RequestAction> actions { get; set; } = new Dictionary<String, RequestAction>(StringComparer.InvariantCultureIgnoreCase);
        public Dictionary<String, RequestDialog> dialogs { get; set; } = new Dictionary<String, RequestDialog>(StringComparer.InvariantCultureIgnoreCase);
        public Dictionary<String, RequestPopup> popups { get; set; } = new Dictionary<String, RequestPopup>(StringComparer.InvariantCultureIgnoreCase);
        public Dictionary<String, RequestCommand> commands { get; set; } = new Dictionary<String, RequestCommand>(StringComparer.InvariantCultureIgnoreCase);

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

        public RequestCommand CurrentCommand
        {
            get
            {
                throw new NotImplementedException();
            }
        }

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
        }

        public static RequestModelInfo GetModelInfo(RequestUrlKind kind, String normalizedUrl)
        {
            // {pathInfo}/action/id - ACTION
            // {pathInfo}/dialog/id - DIALOG
            // {pathInfo}/command/id - COMMAND

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
                default:
                    throw new RequestModelException($"Invalid action kind ({kind})");
            }
            var pathArr = new ArraySegment<String>(urlParts, 0, len - 2);
            mi.path = String.Join("/", pathArr);
            return mi;
        }

        public static async Task<RequestModel> CreateFromUrl(IApplicationHost host, RequestUrlKind kind, String normalizedUrl)
        {
            var mi = GetModelInfo(kind, normalizedUrl);
            String jsonText = await host.ReadTextFile(mi.path, "model.json");
            var rm = JsonConvert.DeserializeObject<RequestModel>(jsonText);
            rm.EndInit();
            rm._action = mi.action;
            rm._dialog = mi.dialog;
            rm._popup = mi.popup;
            rm._command = mi.command;
            rm._data = mi.data;
            rm._modelPath = mi.path;
            rm._id = mi.id == "0" ? null : mi.id;
            return rm;
        }

        public static async Task<RequestModel> CreateFromBaseUrl(IApplicationHost host, String baseUrl)
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
            else
            {
                throw new RequestModelException($"Invalid base url: {baseUrl}");
            }
            var rm = await CreateFromUrl(host, kind, baseUrl);
            rm._kind = kind;
            return rm;
        }
    }
}

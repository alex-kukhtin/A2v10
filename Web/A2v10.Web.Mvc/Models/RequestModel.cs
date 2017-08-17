
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
        Command
    }

    public struct RequestModelInfo
    {
        public String id;
        public String action;
        public String dialog;
        public String command;
        public String path;
    }


    public class RequestBase
    {
        public String model; // or parent
        public String schema; // or parent
        public Boolean index;

        public String template;

        [JsonIgnore]
        private RequestModel _parent;

        internal void SetParent(RequestModel model)
        {
            _parent = model;
        }

        public String Path
        {
            get
            {
                return _parent._modelPath;
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
                    throw new RequestModelException($"Could not update index model {CurrentModel}");
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
        public override string GetView()
        {
            return dialog;
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
        private String _command;

        [JsonIgnore]
        internal String _modelPath;

        public String model; // data model
        public String schema; // schema for data model

        public Dictionary<String, RequestAction> actions { get; set; }
        public Dictionary<String, RequestDialog> dialogs { get; set; }
        public Dictionary<String, RequestCommand> commands { get; set; }

        public RequestAction CurrentAction
        {
            get
            {
                if (actions == null)
                    throw new RequestModelException($"There are no actions in model '{_modelPath}'");
                if (String.IsNullOrEmpty(_action))
                    throw new RequestModelException($"Invalid empty action in model {_modelPath}");
                RequestAction ma;
                if (actions.TryGetValue(_action, out ma))
                    return ma;
                throw new RequestModelException($"Action '{_action}' not found in model {_modelPath}");
            }
        }

        public RequestDialog CurrentDialog
        {
            get
            {
                throw new NotImplementedException();
            }
        }

        public RequestCommand CurrentCommand
        {
            get
            {
                throw new NotImplementedException();
            }
        }


        private void EndInit()
        {
            if (actions != null)
                foreach (var a in actions.Values)
                    a.SetParent(this);
            if (commands != null)
                foreach (var c in commands.Values)
                    c.SetParent(this);
            if (dialogs != null)
                foreach (var d in dialogs.Values)
                    d.SetParent(this);
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
                case RequestUrlKind.Command:
                    mi.command = action;
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
            rm._command = mi.command;
            rm._modelPath = mi.path;
            return rm;
        }
    }
}

// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Dynamic;
using System.Text.RegularExpressions;

using Newtonsoft.Json;

using A2v10.Infrastructure;
using System.IO;
using System.Text;

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
		Upload,
		Report,
		Export,
		Api
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
		public String upload;
	}


	public class RequestBase
	{
		public String model; // or parent
		public String schema; // or parent
		public String source; // or parent
		public Boolean index;
		public Boolean copy;
		public String template;
		public ExpandoObject parameters;

		[JsonIgnore]
		protected RequestModel _parent;

		internal void SetParent(RequestModel model)
		{
			_parent = model;
		}

		[JsonIgnore]
		internal RequestModel ParentModel => _parent;

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
				String action =
					index ? "Index" :
					copy ? "Copy" : "Load";
				return $"[{CurrentSchema}].[{cm}.{action}]";
			}
		}

		[JsonIgnore]
		public String ExportProcedure
		{
			get
			{
				var cm = CurrentModel;
				if (String.IsNullOrEmpty(cm))
					return null;
				String action = index ? "Index" : "Load";
				return $"[{CurrentSchema}].[{cm}.{action}.Export]";
			}
		}

		public String LoadLazyProcedure(String propName)
		{
			var cm = CurrentModel;
			if (String.IsNullOrEmpty(cm))
				return null;
			return $"[{CurrentSchema}].[{cm}.{propName}]";
		}

		public String DeleteProcedure(String prop)
		{
			var cm = CurrentModel;
			if (String.IsNullOrEmpty(cm))
				return null;
			String suffix = prop;
			if (!String.IsNullOrEmpty(suffix))
				suffix = "." + suffix;
			return $"[{CurrentSchema}].[{cm}{suffix}.Delete]";
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
				if (source == null)
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

	public class TargetModel
	{
		public String schema;
		public String model;
		public String view;
		public String template;
	}

	public abstract class RequestView : RequestBase
	{
		public String view;
		public String hook;
		public Boolean indirect;
		public String target;
		public String targetId;
		public TargetModel targetModel;

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
			var modelHandler = System.Activator.CreateInstance(assemblyName: assemblyName, typeName: typeName,
				ignoreCase: false, bindingAttr: 0,
				binder: null, args: new Object[] { host },
				culture: null,
				activationAttributes: null).Unwrap();
			if (!(modelHandler is IModelHandler))
				throw new RequestModelException($"{typeName} must implement interface IModelHandler");
			return modelHandler as IModelHandler;
		}
	}

	public enum RequestExportFormat
	{
		unknown,
		xlsx
	}

	public class RequestExport
	{
		public String fileName;
		public String template;
		public RequestExportFormat format;
	}

	public class RequestAction : RequestView
	{
		[JsonProperty("export")]
		public RequestExport Export { get; set; }
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
		clr,
		xml,
		startProcess,
		resumeProcess
	}

	public class RequestCommand : RequestBase
	{
		public String command;
		public CommandType type;
		public String procedure;
		public String file;
		public String clrType;
		public Boolean async;
		public String wrapper;
		public IList<String> xmlSchemas;
		public Boolean validate;

		[JsonIgnore]
		public String CommandProcedure => $"[{CurrentSchema}].[{procedure}]";

		[JsonIgnore]
		public String XmlProcedure
		{
			get
			{
				var cm = CurrentModel;
				if (String.IsNullOrEmpty(cm))
					return null;
				return $"[{CurrentSchema}].[{cm}.Report]";
			}
		}

		[JsonIgnore]
		public String ActionBase
		{
			get
			{
				return _parent._modelPath;
			}
		}
	}

	public enum RequestReportType
	{
		stimulsoft,
		xml
	}

	public class RequestReport : RequestBase
	{
		public String report;
		public String name;
		public String procedure;
		public IList<String> xmlSchemas;
		public RequestReportType type;
		public String encoding;
		public Boolean validate;

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

		[JsonIgnore]
		public Boolean HasPath => type == RequestReportType.stimulsoft;
	}

	public enum RequestUploadParseType
	{
		none,
		excel
	}


	public class RequestUpload : RequestBase
	{
		public RequestUploadParseType parse;
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
		private String _upload;
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

		[JsonProperty("actions")]
		public Dictionary<String, RequestAction> Actions { get; set; } = new Dictionary<String, RequestAction>(StringComparer.InvariantCultureIgnoreCase);
		[JsonProperty("dialogs")]
		public Dictionary<String, RequestDialog> Dialogs { get; set; } = new Dictionary<String, RequestDialog>(StringComparer.InvariantCultureIgnoreCase);
		[JsonProperty("popups")]
		public Dictionary<String, RequestPopup> Popups { get; set; } = new Dictionary<String, RequestPopup>(StringComparer.InvariantCultureIgnoreCase);
		[JsonProperty("commands")]
		public Dictionary<String, RequestCommand> Commands { get; set; } = new Dictionary<String, RequestCommand>(StringComparer.InvariantCultureIgnoreCase);
		[JsonProperty("reports")]
		public Dictionary<String, RequestReport> Reports { get; set; } = new Dictionary<String, RequestReport>(StringComparer.InvariantCultureIgnoreCase);
		[JsonProperty("uploads")]
		public Dictionary<String, RequestUpload> Uploads { get; set; } = new Dictionary<String, RequestUpload>(StringComparer.InvariantCultureIgnoreCase);


		[JsonIgnore]
		public String ModelAction => _action;
		[JsonIgnore]
		public String ModelCommand => _command;

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
				if (Actions.Count == 0)
					throw new RequestModelException($"There are no actions in model '{_modelPath}'");
				if (String.IsNullOrEmpty(_action))
					throw new RequestModelException($"Invalid empty action in url for model {_modelPath}");
				if (Actions.TryGetValue(_action.ToLowerInvariant(), out RequestAction ma))
					return ma;
				throw new RequestModelException($"Action '{_action}' not found in model {_modelPath}");
			}
		}

		public RequestDialog CurrentDialog
		{
			get
			{
				if (Dialogs.Count == 0)
					throw new RequestModelException($"There are no dialogs in model '{_modelPath}'");
				if (String.IsNullOrEmpty(_dialog))
					throw new RequestModelException($"Invalid empty dialog in url for {_modelPath}");
				if (Dialogs.TryGetValue(_dialog, out RequestDialog da))
					return da;
				throw new RequestModelException($"Dialog '{_dialog}' not found in model {_modelPath}");
			}
		}

		public RequestPopup CurrentPopup
		{
			get
			{
				if (Popups.Count == 0)
					throw new RequestModelException($"There are no popups in model '{_modelPath}'");
				if (String.IsNullOrEmpty(_popup))
					throw new RequestModelException($"Invalid empty popup in url for {_modelPath}");
				if (Popups.TryGetValue(_popup, out RequestPopup pa))
					return pa;
				throw new RequestModelException($"Popup '{_popup}' not found in model {_modelPath}");
			}
		}

		public RequestCommand CurrentCommand
		{
			get
			{
				return GetCommand(_command);
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
			foreach (var a in Actions.Values)
				a.SetParent(this);
			foreach (var c in Commands.Values)
				c.SetParent(this);
			foreach (var d in Dialogs.Values)
				d.SetParent(this);
			foreach (var p in Popups.Values)
				p.SetParent(this);
			foreach (var r in Reports.Values)
				r.SetParent(this);
			foreach (var u in Uploads.Values)
				u.SetParent(this);
		}

		public RequestCommand GetCommand(String command)
		{
			if (Commands.TryGetValue(command, out RequestCommand cmd))
			{
				cmd.command = command;
				return cmd;
			}
			throw new RequestModelException($"Command '{command}' not found in model.json");
		}

		public RequestReport GetReport()
		{
			if (Reports.TryGetValue(_report, out RequestReport rep))
				return rep;
			throw new RequestModelException($"Report '{_report}' not found");
		}

		public RequestUpload GetUpload()
		{
			if (Uploads.TryGetValue(_upload, out RequestUpload upload))
				return upload;
			throw new RequestModelException($"Upload '{_upload}' not found");
		}

		public static RequestModelInfo GetModelInfo(RequestUrlKind kind, String normalizedUrl)
		{
			// {pathInfo}/action/id - ACTION
			// {pathInfo}/dialog/id - DIALOG
			// {pathInfo}/command/id - COMMAND
			// {pathInfo}/image/id - IMAGE
			// {pathInfo}/action/ - api

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
			switch (kind)
			{
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
				case RequestUrlKind.Upload:
					mi.upload = action;
					break;
				case RequestUrlKind.Report:
					mi.report = action;
					break;
				case RequestUrlKind.Export:
					mi.action = action;
					break;
				case RequestUrlKind.Api:
					mi.command = action;
					break;
				default:
					throw new RequestModelException($"Invalid action kind ({kind})");
			}
			var pathArr = new ArraySegment<String>(urlParts, 0, len - 2);
			mi.path = String.Join("/", pathArr);
			return mi;
		}

		static async Task<String> Redirect(IApplicationHost host, Boolean bAdmin, String path)
		{
			await StartWatcher(host, bAdmin);
			if (_redirect == null)
				return path;
			if (_redirect.TryGetValue(path, out String outPath))
				return outPath;
			return path;
		}

		static Boolean _redirectLoaded;
		static FileSystemWatcher _redirectWatcher;
		static IDictionary<String, String> _redirect;

		static async Task StartWatcher(IApplicationHost host, Boolean bAdmin)
		{
			if (_redirectLoaded)
				return;
			String redFilePath = host.MakeFullPath(bAdmin, String.Empty, "redirect.json");
			if (System.IO.File.Exists(redFilePath))
			{
				String json = await host.ReadTextFile(bAdmin, String.Empty, "redirect.json");
				_redirect = JsonConvert.DeserializeObject<Dictionary<String, String>>(json);
			}
			if (host.IsDebugConfiguration && _redirectWatcher == null)
			{
				_redirectWatcher = new FileSystemWatcher(Path.GetDirectoryName(redFilePath), "*.json")
				{
					NotifyFilter = NotifyFilters.LastWrite | NotifyFilters.Size | NotifyFilters.Attributes | NotifyFilters.LastAccess
				};
				_redirectWatcher.Changed += (sender, e) =>
				{
					_redirectLoaded = false;
				};
				_redirectWatcher.EnableRaisingEvents = true;
			}
			_redirectLoaded = true;
		}

		public static async Task<RequestModel> CreateFromUrl(IApplicationHost host, Boolean bAdmin, RequestUrlKind kind, String normalizedUrl)
		{
			var mi = GetModelInfo(kind, normalizedUrl);
			String pathForLoad = await Redirect(host, bAdmin, mi.path);
			String jsonText = await host.ReadTextFile(bAdmin, pathForLoad, "model.json");
			var rm = JsonConvert.DeserializeObject<RequestModel>(jsonText);
			rm.EndInit();
			rm._action = mi.action;
			rm._dialog = mi.dialog;
			rm._popup = mi.popup;
			rm._command = mi.command;
			rm._report = mi.report;
			rm._upload = mi.upload;
			rm._data = mi.data;
			rm._modelPath = pathForLoad;
			rm._id = ((mi.id == "0") || (mi.id == "new")) ? null : mi.id;
			return rm;
		}

		public static async Task<RequestModel> CreateFromApiUrl(IApplicationHost host, String apiUrl)
		{
			apiUrl = apiUrl.ToLowerInvariant();
			var rm = await CreateFromUrl(host, false, RequestUrlKind.Api, apiUrl + "/0" /*id*/);
			rm._kind = RequestUrlKind.Api;
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
			else if (baseUrl.StartsWith("/_upload"))
			{
				kind = RequestUrlKind.Upload;
				baseUrl = baseUrl.Substring(9);
			}
			else if (baseUrl.StartsWith("/_report"))
			{
				kind = RequestUrlKind.Report;
				baseUrl = baseUrl.Substring(9);
			}
			else if (baseUrl.StartsWith("/_export"))
			{
				kind = RequestUrlKind.Export;
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

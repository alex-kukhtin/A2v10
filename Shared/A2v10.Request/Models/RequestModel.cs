﻿// Copyright © 2015-2023 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Dynamic;
using System.Text.RegularExpressions;
using System.IO;
using System.Text;

using Newtonsoft.Json;

using A2v10.Interop;
using A2v10.Infrastructure;

namespace A2v10.Request;

public sealed class RequestModelException : Exception
{
	public RequestModelException(String message)
		: base(message)
	{
	}
	public RequestModelException()
	{
	}

	public RequestModelException(String message, Exception innerException)
		: base(message, innerException)
	{
	}
}

[Flags]
public enum PermissionBits
{
	View = 0x1,
	Edit = 0x2,
	Delete = 0x4,
	Apply = 0x8
}

public enum RequestUrlKind
{
	Page,
	Dialog,
	Popup,
	Command,
	Data,
	Image,
	Attachment,
	File,
	Report,
	Export,
	Api,
	Simple
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
	public String file;
}


public class RequestMerge
{
	public String model;
	public String source;
	public String schema;
	public ExpandoObject parameters;
}

public class RequestEvent
{
	public String model;
	public String source;
	public String schema;

	public String CurrentSource(RequestBase br)
	{
		return String.IsNullOrEmpty(source) ? br.CurrentSource : source;
	}

	public String UpdateProcedure(RequestBase br)
	{
		var cm = model;
		var sch = schema;
		if (String.IsNullOrEmpty(cm))
			cm = br.CurrentModel;
		if (String.IsNullOrEmpty(sch))
			sch = br.CurrentSchema;
		return $"[{sch}].[{cm}.Update]";
	}
}

public class RequestEvents
{
	public RequestEvent afterSave;
}

public class RequestBase
{
	public String model; // or parent
	public String schema; // or parent
	public String source; // or parent
	public Boolean index;
	public Boolean skipDataStack;
	public Boolean plain;
	public Boolean copy;
	public String template;
	public String script;
	public ExpandoObject parameters;
	public RequestMerge merge;
	public RequestEvents events;
	public String invoke;
	public String checkTypes;
	public Boolean processDbEvents;
	public Int32 commandTimeout;

	public PermissionSet permissions;

	[JsonIgnore]
	protected RequestModel _parent;

	internal void SetParent(RequestModel model)
	{
		_parent = model;
	}

	[JsonIgnore]
	internal RequestModel ParentModel => _parent;

	[JsonIgnore]
	internal Boolean HasMerge => merge != null && !String.IsNullOrEmpty(merge.model);

	[JsonIgnore]
	public String Path => _parent._modelPath;

	[JsonIgnore]
	public String Id => _parent._id;

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
	public String MergeLoadProcedure
	{
		get
		{
			if (merge == null)
				throw new InvalidOperationException("_parent is null");
			return $"[{MergeSchema}].[{merge.model}.Load]";
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
				throw new NotSupportedException($"Could not update index model '{CurrentModel}'");
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
				throw new InvalidOperationException("_parent is null");
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
				throw new InvalidOperationException("_parent is null");
			if (source == null)
				return _parent.CurrentSource;
			return source;
		}
	}

	[JsonIgnore]
	public String MergeSource
	{
		get
		{
			if (merge == null)
				throw new InvalidOperationException("merge is null");
			if (String.IsNullOrEmpty(merge.source))
				return CurrentSource;
			return merge.source;
		}
	}

	[JsonIgnore]
	public String MergeSchema
	{
		get
		{
			if (merge == null)
				throw new InvalidOperationException("merge is null");
			if (String.IsNullOrEmpty(merge.schema))
				return CurrentSchema;
			return merge.schema;
		}
	}

	[JsonIgnore]
	public String CurrentModel
	{
		get
		{
			if (_parent == null)
				throw new InvalidOperationException("_parent is null");
			if (model == null)
				return _parent.model;
			return model;
		}
	}

	public String GetInvokeTarget()
	{
		if (String.IsNullOrEmpty(invoke))
			return null;
		return invoke;
	}

	public void CheckPermissions(String actual, Boolean debug)
	{
		if (actual == "_admin_")
			return;
		permissions?.CheckAllow(actual, debug);
	}
}

public class TargetModel
{
	public String schema;
	public String model;
	public String view;
	public String viewMobile;
	public String template;
}

public abstract class RequestView : RequestBase
{
	public String view;
	public String viewMobile;
	public String hook;
	public Boolean indirect;
	public String target;
	public String targetId;
	public TargetModel targetModel;

	public List<String> scripts;
	public List<String> styles;

	public String GetView(Boolean mobile)
	{
		if (mobile && !String.IsNullOrEmpty(viewMobile))
			return viewMobile;
		return view;
	}

	public RequestUrlKind CurrentKind => _parent.CurrentKind;

	public virtual Boolean IsDialog { get { return false; } }

	public String GetRelativePath(String extension, Boolean mobile)
	{
		return $"~/{Path}/{GetView(mobile)}{extension}";
	}

	public IModelHandler GetHookHandler()
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
			binder: null,
			args: null,
			culture: null,
			activationAttributes: null).Unwrap();
		if (modelHandler is not IModelHandler)
			throw new RequestModelException($"{typeName} must implement interface IModelHandler");

		ClrInvoker.CallInject(modelHandler);
		return modelHandler as IModelHandler;
	}
}

public enum RequestExportFormat
{
	unknown,
	xlsx,
	dbf,
	csv
}


public class RequestExport
{
	public String fileName;
	public String template;
	public RequestExportFormat format;
	public String encoding;

	public String GetTemplateExpression()
	{
		return template.TemplateExpression();
	}

	public Encoding GetEncoding()
	{
		return encoding switch
		{
			"1251" => Encoding.GetEncoding(1251),
			"866" => Encoding.GetEncoding(866),
			"utf8" => Encoding.UTF8,
			_ => throw new RequestModelException($"Invalid encoding value '{encoding}'. Possible values are 'utf8', '1251', '866'"),
		};
	}
}

public class RequestAction : RequestView
{
	[JsonProperty("export")]
	public RequestExport Export { get; set; }

	public String GetModelScripts()
	{
		if (scripts == null)
			return null;
		var sb = new StringBuilder();
		foreach (var s in scripts)
		{
			sb.Append($"<script type=\"text/javascript\" src=\"{s}\"></script>\n");
		}
		return sb.ToString();
	}

	public String GetModelStyles()
	{
		if (styles == null)
			return null;
		var sb = new StringBuilder();
		foreach (var s in styles)
		{
			sb.Append($"<link  href=\"{s}\" rel=\"stylesheet\" />\n");
		}
		return sb.ToString();
	}
}

public class RequestDialog : RequestView
{
	public override Boolean IsDialog { get { return true; } }
	[JsonProperty("twoPhase")]
	public Boolean TwoPhase { get; set; }

	public void CheckPhase(Boolean phase2)
	{
		if (!TwoPhase) return;
		if (phase2) return;
		// no model, no template for the first phase
		model = String.Empty;
		template = null;
	}
}

public class RequestPopup : RequestView
{
}

public enum CommandType
{
	none,
	sql,
	clr,
	script,
	javascript,
	xml,
	file,
	startProcess,
	resumeProcess,
	callApi,
	sendMessage,
	processDbEvents,
	// core
	invokeTarget
}

public class RequestCommand : RequestBase
{
	[JsonIgnore]
	public String command;

	[JsonProperty("command")]
	public String commandProp;

	public CommandType type;
	public String procedure;
	public String file;
	public String clrType;
	public Boolean async;
	public String wrapper;
	public ExpandoObject args;

	public IList<String> xmlSchemas;
	public Boolean validate;
	public Boolean debugOnly;

	// for api
	public String allowOrigin;
	public String allowHost;
	public String allowAddress;
	public String method;
	public Boolean authorize;
	public Int32 errorCode;

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

	[JsonIgnore]
	public String AllowAddressForCheck
	{
		get
		{
			if (String.IsNullOrEmpty(allowAddress))
				return _parent.allowAddress;
			return allowAddress;
		}
	}
	[JsonIgnore]
	public String AllowOriginForCheck
	{
		get
		{
			if (String.IsNullOrEmpty(allowOrigin))
				return _parent.allowOrigin;
			return allowOrigin;
		}
	}
	[JsonIgnore]
	public String AllowHostForCheck
	{
		get
		{
			if (String.IsNullOrEmpty(allowHost))
				return _parent.allowHost;
			return allowHost;
		}
	}

	public Boolean IsGet()
	{
		return String.IsNullOrEmpty(method) || method == "get";
	}

	public Boolean IsPost()
	{
		return String.IsNullOrEmpty(method) || method == "post";
	}

	public Task<ServerCommandResult> ExecuteCommand(IServiceLocator locator, ExpandoObject data)
	{
		var cmd = ServerCommandRegistry.GetCommand(locator, type);
		return cmd.Execute(this, data);
	}
}

public enum RequestReportType
{
	stimulsoft,
	xml,
	json,
	pdf,
	xlsx
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
	public Boolean HasPath => type == RequestReportType.stimulsoft || type == RequestReportType.pdf || type == RequestReportType.xlsx;

	public String GetExtension() {
		return type switch
		{
			RequestReportType.stimulsoft => ".mrt",
			RequestReportType.pdf => ".xaml",
			RequestReportType.xlsx => ".xaml",
			_ => "",
		};
	}

	[JsonIgnore]
	public Boolean ReportFromDataModel => ReportName != null && ReportName.Contains("{{");

	public String ReportExpression => ReportName.TemplateExpression();
}

public enum RequestFileParseType
{
	none,
	excel,
	xlsx,
	csv,
	dbf,
	xml,
	auto,
	json
}

public enum RequestFileType
{
	sql,
	clr,
	parse,
	azureBlob,
	json
}


public class RequestFileAvaliModel
{
	public String columns;

	public String schema;
	public String model;
	public String source;
	public ExpandoObject parameters;

	public Boolean Match(String fileName, String cols)
	{
		var bCols = columns == null || columns == cols;
		var bFile = true;
		return bCols && bFile;
	}

	public String CurrentSource(RequestFile file)
	{
		return String.IsNullOrEmpty(source) ? file.CurrentSource : source;
	}

	public String UpdateProcedure(RequestFile file)
	{
		var sch = String.IsNullOrEmpty(schema) ? file.CurrentSchema : schema;
		return $"[{sch}].[{model}.Update]";
	}
}

public class ImageSettings
{
	public Int32 quality;
	public Int32 threshold;
}

public class RequestFile : RequestBase
{
	public RequestFileType type;
	public RequestFileParseType parse;
	public String clrType;
	public Boolean async;
	public String container;
	public String azureSource;
	public ImageSettings imageCompress;
	public String locale;
	public String outputFileName;
	public Boolean zip;

	public List<RequestFileAvaliModel> availableModels;
	[JsonIgnore]
	public String FileProcedureUpdate => $"[{CurrentSchema}].[{CurrentModel}.Update]";
	[JsonIgnore]
	public String FileProcedureLoad => $"[{CurrentSchema}].[{CurrentModel}.Load]";

	public RequestFileAvaliModel FindModel(String fileName, String columns)
	{
		return availableModels?.Find(m => m.Match(fileName, columns));
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
	private String _file;
	private String _data;
	private RequestUrlKind _kind;

	private IApplicationHost _host;

	[JsonIgnore]
	internal String _modelPath;
	[JsonIgnore]
	internal String _id;

	[JsonIgnore]
	internal Boolean Phase2;

	public String model;  // data model
	public String schema; // schema for data model
	public String source; // connection string for data model
	public String module; // module name for license manager

	[JsonIgnore]
	internal RequestUrlKind CurrentKind => _kind;

	// for API
	public String allowAddress;
	public String allowOrigin;
	public String allowHost;

	[JsonProperty("imageSettings")]
	public Dictionary<String, ImageSettings> ImageSettings { get; set; } = new();

	[JsonProperty("actions")]
	public Dictionary<String, RequestAction> Actions { get; set; } = new Dictionary<String, RequestAction>(StringComparer.OrdinalIgnoreCase);
	[JsonProperty("dialogs")]
	public Dictionary<String, RequestDialog> Dialogs { get; set; } = new Dictionary<String, RequestDialog>(StringComparer.OrdinalIgnoreCase);
	[JsonProperty("popups")]
	public Dictionary<String, RequestPopup> Popups { get; set; } = new Dictionary<String, RequestPopup>(StringComparer.OrdinalIgnoreCase);
	[JsonProperty("commands")]
	public Dictionary<String, RequestCommand> Commands { get; set; } = new Dictionary<String, RequestCommand>(StringComparer.OrdinalIgnoreCase);
	[JsonProperty("reports")]
	public Dictionary<String, RequestReport> Reports { get; set; } = new Dictionary<String, RequestReport>(StringComparer.OrdinalIgnoreCase);
	[JsonProperty("files")]
	public Dictionary<String, RequestFile> Files { get; set; } = new Dictionary<String, RequestFile>(StringComparer.OrdinalIgnoreCase);


	[JsonIgnore]
	public String ModelAction => _action;
	[JsonIgnore]
	public String ModelCommand => _command;
	[JsonIgnore]
	public String ModelDialog => _dialog;
	[JsonIgnore]
	public String ModelFile => _file;

	[JsonIgnore]
	public String CurrentSource => source ?? _host.TenantDataSource;

	[JsonIgnore]
	public RequestDataAction DataAction
	{
		get
		{
			switch (_data.ToLowerInvariant())
			{
				case "save": return RequestDataAction.Save;
				default:
					throw new InvalidOperationException($"Invalid data action {_data}");
			}
		}
	}

	[JsonIgnore]
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
					throw new InvalidOperationException($"Invalid RequestKind '{_kind}' for indirect query");
			}
			return $"/{kind}/{_modelPath}/{_action}/{_id}";
		}
	}

	[JsonIgnore]
	public String BasePath =>
		_kind switch
			{
				RequestUrlKind.Page => $"{_modelPath}/{_action}/{_id}",
				RequestUrlKind.Dialog => $"{_modelPath}/{_dialog}/{_id}",
				_ => null,
			};

	public RequestAction CurrentAction
	{
		get
		{
			if (Actions.Count == 0)
				throw new InvalidOperationException($"There are no actions in model '{_modelPath}'");
			if (String.IsNullOrEmpty(_action))
				throw new InvalidOperationException($"Invalid empty action in url for model {_modelPath}");
			if (Actions.TryGetValue(_action, out RequestAction ma))
				return ma;
			throw new InvalidOperationException($"Action '{_action}' not found in model {_modelPath}");
		}
	}

	public RequestDialog CurrentDialog
	{
		get
		{
			if (Dialogs.Count == 0)
				throw new InvalidOperationException($"There are no dialogs in model '{_modelPath}'");
			if (String.IsNullOrEmpty(_dialog))
				throw new InvalidOperationException($"Invalid empty dialog in url for {_modelPath}");
			if (Dialogs.TryGetValue(_dialog, out RequestDialog da))
			{
				da.CheckPhase(Phase2);
				return da;
			}
			throw new InvalidOperationException($"Dialog '{_dialog}' not found in model {_modelPath}");
		}
	}

	public RequestPopup CurrentPopup
	{
		get
		{
			if (Popups.Count == 0)
				throw new InvalidOperationException($"There are no popups in model '{_modelPath}'");
			if (String.IsNullOrEmpty(_popup))
				throw new InvalidOperationException($"Invalid empty popup in url for {_modelPath}");
			if (Popups.TryGetValue(_popup, out RequestPopup pa))
				return pa;
			throw new InvalidOperationException($"Popup '{_popup}' not found in model {_modelPath}");
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
			a?.SetParent(this);
		foreach (var c in Commands.Values)
			c?.SetParent(this);
		foreach (var d in Dialogs.Values)
			d?.SetParent(this);
		foreach (var p in Popups.Values)
			p?.SetParent(this);
		foreach (var r in Reports.Values)
			r?.SetParent(this);
		foreach (var u in Files.Values)
			u?.SetParent(this);
	}

	public RequestCommand GetCommand(String command)
	{
		if (Commands.TryGetValue(command, out RequestCommand cmd))
		{
			cmd.command = command;
			return cmd;
		}
		throw new RequestModelException($"Command '{command}' not found in '/{_modelPath}/model.json'");
	}

	public RequestReport GetReport()
	{
		if (Reports.TryGetValue(_report, out RequestReport rep))
			return rep;
		throw new RequestModelException($"Report '{_report}' not found");
	}

	public RequestFile GetFile()
	{
		if (Files.TryGetValue(_file, out RequestFile file))
			return file;
		throw new RequestModelException($"File '{_file}' not found");
	}

	public static RequestModelInfo GetModelInfo(RequestUrlKind kind, String normalizedUrl)
	{
		// {pathInfo}/action/id - ACTION
		// {pathInfo}/dialog/id - DIALOG
		// {pathInfo}/command/id - COMMAND
		// {pathInfo}/image/id - IMAGE
		// {pathInfo}/action/ - api

		var mi = new RequestModelInfo();

		if (kind == RequestUrlKind.Simple) {
			mi.path = normalizedUrl.ToLowerInvariant();
			return mi;
		}

		String[] urlParts = normalizedUrl.Split('/');
		Int32 len = urlParts.Length;
		if (len < 3)
		{
			// min: {path}/{act}/id 
			throw new RequestModelException($"invalid url ({normalizedUrl})");
		}
		mi.id = urlParts[len - 1];
		String action = urlParts[len - 2].ToLowerInvariant();
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
			case RequestUrlKind.Attachment:
				mi.action = action;
				break;
			case RequestUrlKind.File:
				mi.file = action;
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
		mi.path = String.Join("/", pathArr).ToLowerInvariant();
		return mi;
	}

	static readonly Lazy<RedirectModule> _redirect = new (() => new RedirectModule(), isThreadSafe: true);

	public static RequestAction GetActionFromUrl(IApplicationHost host, String normalizedUrl)
	{
		if (normalizedUrl == null)
			return null;
		String[] urlParts = normalizedUrl.Split('/');
		Int32 len = urlParts.Length;
		if (len < 3)
		{
			return null;
		}
		var pathArr = new ArraySegment<String>(urlParts, 0, len - 2);
		String action = urlParts[len - 2].ToLowerInvariant();
		var pathForLoad = String.Join("/", pathArr).ToLowerInvariant();
		String jsonText = host.ApplicationReader.ReadTextFile(pathForLoad, "model.json");
		if (jsonText == null)
			return null;
		var rm = JsonConvert.DeserializeObject<RequestModel>(jsonText);
		if (rm.Actions.TryGetValue(action, out RequestAction requestAction))
			return requestAction;
		return null;
	}

	public static async Task<RequestModel> CreateFromUrl(IApplicationHost host, RequestUrlKind kind, String normalizedUrl)
	{
		var mi = GetModelInfo(kind, normalizedUrl);
		String pathForLoad = _redirect.Value.Redirect(mi.path);
		String jsonText = await host.ApplicationReader.ReadTextFileAsync(pathForLoad, "model.json") 
				?? throw new FileNotFoundException($"File not found '{pathForLoad}/model.json'");
		var rm = JsonConvert.DeserializeObject<RequestModel>(jsonText);
		rm._host = host;
		rm.EndInit();
		rm._action = mi.action;
		rm._dialog = mi.dialog;
		rm._popup = mi.popup;
		rm._command = mi.command;
		rm._report = mi.report;
		rm._file = mi.file;
		rm._data = mi.data;
		rm._modelPath = pathForLoad;
		rm._kind = kind;
		rm._id = ((mi.id == "0") || (mi.id == "new")) ? null : mi.id;
		return rm;
	}

	public static async Task<RequestModel> CreateFromApiUrl(IApplicationHost host, String apiUrl)
	{
		//apiUrl = apiUrl.ToLowerInvariant();
		var rm = await CreateFromUrl(host, RequestUrlKind.Api, apiUrl + "/0" /*id*/);
		rm._kind = RequestUrlKind.Api;
		return rm;
	}

	public static async Task<RequestModel> CreateFromBaseUrl(IApplicationHost host, String baseUrl)
	{
		//baseUrl = baseUrl.ToLowerInvariant();
		RequestUrlKind kind;
		if (baseUrl.StartsWith("/_dialog", StringComparison.OrdinalIgnoreCase))
		{
			kind = RequestUrlKind.Dialog;
			baseUrl = baseUrl.Substring(9);
		}
		else if (baseUrl.StartsWith("/_page", StringComparison.OrdinalIgnoreCase))
		{
			kind = RequestUrlKind.Page;
			baseUrl = baseUrl.Substring(7);
		}
		else if (baseUrl.StartsWith("/_popup", StringComparison.OrdinalIgnoreCase))
		{
			kind = RequestUrlKind.Popup;
			baseUrl = baseUrl.Substring(8);
		}
		else if (baseUrl.StartsWith("/_image", StringComparison.OrdinalIgnoreCase))
		{
			kind = RequestUrlKind.Image;
			baseUrl = baseUrl.Substring(8);
		}
		else if (baseUrl.StartsWith("/_attachment", StringComparison.OrdinalIgnoreCase))
		{
			kind = RequestUrlKind.Attachment;
			baseUrl = baseUrl.Substring(13);
		}
		else if (baseUrl.StartsWith("/_file", StringComparison.OrdinalIgnoreCase))
		{
			kind = RequestUrlKind.File;
			baseUrl = baseUrl.Substring(7);
		}
		else if (baseUrl.StartsWith("/_report", StringComparison.OrdinalIgnoreCase))
		{
			kind = RequestUrlKind.Report;
			baseUrl = baseUrl.Substring(9);
		}
		else if (baseUrl.StartsWith("/_export", StringComparison.OrdinalIgnoreCase))
		{
			kind = RequestUrlKind.Export;
			baseUrl = baseUrl.Substring(9);
		}
		else if (baseUrl.StartsWith("/_simple", StringComparison.OrdinalIgnoreCase))
		{
			kind = RequestUrlKind.Simple;
			baseUrl = baseUrl.Substring(9);
		}
		else
		{
			// default : page
			kind = RequestUrlKind.Page;
		}
		var rm = await CreateFromUrl(host, kind, baseUrl);
		rm._kind = kind;
		return rm;
	}
}

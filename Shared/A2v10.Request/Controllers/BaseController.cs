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
using A2v10.Data.Interfaces;
using System.Threading;
using System.Web;
using A2v10.Request.Properties;

namespace A2v10.Request
{
	public partial class BaseController
	{
		protected readonly IApplicationHost _host;
		protected readonly IDbContext _dbContext;
		protected readonly IRenderer _renderer;
		protected readonly IWorkflowEngine _workflowEngine;
		protected readonly ILocalizer _localizer;
		protected readonly IDataScripter _scripter;
		protected readonly IMessageService _messageService;
		protected readonly IUserStateManager _userStateManager;

		public class DataModelAndView
		{
			public IDataModel Model;
			public RequestView RequestView;
		}

		public const String NO_VIEW = "\b_NO_VIEW_\b";

		public BaseController()
		{
			// DI ready
			IServiceLocator locator = ServiceLocator.Current;
			_host = locator.GetService<IApplicationHost>();
			_dbContext = locator.GetService<IDbContext>();
			_renderer = locator.GetServiceOrNull<IRenderer>();
			_workflowEngine = locator.GetServiceOrNull<IWorkflowEngine>();
			_localizer = locator.GetService<ILocalizer>();
			_scripter = locator.GetService<IDataScripter>();
			_messageService = locator.GetServiceOrNull<IMessageService>();
			_userStateManager = locator.GetServiceOrNull<IUserStateManager>();
		}

		public Boolean IsDebugConfiguration => _host.IsDebugConfiguration;
		public IDbContext DbContext => _dbContext;
		public IApplicationHost Host => _host;
		public Boolean Admin { get; set; }

		public String CurrentLang
		{
			get
			{
				var culture = Thread.CurrentThread.CurrentUICulture;
				var lang = culture.TwoLetterISOLanguageName;
				return lang;
			}
		}

		public String Localize(String content)
		{
			return _localizer.Localize(null, content);
		}

		public async Task RenderApplicationKind(RequestUrlKind kind, String pathInfo, ExpandoObject loadPrms, TextWriter writer)
		{
			var segs = pathInfo.Split('/');
			if (segs.Length < 2)
				throw new RequestModelException($"Invalid application Url: {pathInfo}");
			if (segs[0] != "app")
				throw new RequestModelException($"Invalid application Url: {pathInfo}");
			switch (segs[1])
			{
				case "about":
					if (kind != RequestUrlKind.Page)
						throw new RequestModelException($"Invalid application Url: {pathInfo}");
					await RenderAbout(writer);
					break;
				case "changepassword":
					if (kind != RequestUrlKind.Dialog)
						throw new RequestModelException($"Invalid application Url: {pathInfo}");
					await RenderChangePassword(writer, loadPrms);
					break;
				default:
					// find page
					if (kind != RequestUrlKind.Page)
						throw new RequestModelException($"Invalid application Url: {pathInfo}");
					await RenderAppPage(writer, segs[1]);
					break;
			}
		}

		public async Task RenderModel(String pathInfo, ExpandoObject loadPrms, TextWriter writer)
		{
			RequestModel rm = await RequestModel.CreateFromUrl(_host, Admin, RequestUrlKind.Page, pathInfo);
			RequestView rw = rm.GetCurrentAction(RequestUrlKind.Page);
			rw.view = NO_VIEW; // no view here
			await Render(rw, writer, loadPrms);
		}

		public async Task RenderElementKind(RequestUrlKind kind, String pathInfo, ExpandoObject loadPrms, TextWriter writer)
		{
			RequestModel rm = await RequestModel.CreateFromUrl(_host, Admin, kind, pathInfo);
			RequestView rw = rm.GetCurrentAction(kind);
			await Render(rw, writer, loadPrms);
		}

		async Task<RequestView> LoadIndirect(RequestView rw, IDataModel innerModel, ExpandoObject loadPrms)
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
					loadPrms.Set("Id", rw.Id);
					var newModel = await _dbContext.LoadModelAsync(rw.CurrentSource, loadProc, loadPrms);
					innerModel.Merge(newModel);
				}
			}
			return rw;
		}

		internal async Task<DataModelAndView> GetDataModelForView(RequestView rw, ExpandoObject loadPrms)
		{
			var dmv = new DataModelAndView()
			{
				RequestView = rw
			};
			String loadProc = rw.LoadProcedure;
			IDataModel model = null;
			if (rw.parameters != null && loadPrms == null)
				loadPrms = rw.parameters;
			if (loadPrms != null)
			{
				loadPrms.Set("Id", rw.Id);
				loadPrms.AppendAndReplace(rw.parameters);
			}
			if (loadProc != null)
			{
				ExpandoObject prms2 = loadPrms;
				if (rw.indirect)
				{
					// for indirect - @TenantId, @UserId and @Id only
					prms2 = new ExpandoObject();
					prms2.Set("Id", rw.Id);
					if (loadPrms != null)
					{
						prms2.Set("UserId", loadPrms.Get<Int64>("UserId"));
						prms2.Set("TenantId", loadPrms.Get<Int32>("TenantId"));
					}
				}
				model = await _dbContext.LoadModelAsync(rw.CurrentSource, loadProc, prms2);
				if (!String.IsNullOrEmpty(rw.Id) && !rw.copy)
				{
					var me = model.MainElement;
					if (me.Metadata != null)
					{
						var modelId = me.Id ?? String.Empty;
						if (rw.Id != modelId.ToString())
							throw new RequestModelException($"Element not found. Id={rw.Id}");
					}
				}
			}
			if (rw.indirect)
				rw = await LoadIndirect(rw, model, loadPrms);
			if (model?.Root != null)
			{
				// side effect!
				rw.view = model.Root.Resolve(rw.view);
				rw.template = model.Root.Resolve(rw.template);
			}

			if (_userStateManager != null && model != null)
			{
				Int64 userId = loadPrms.Get<Int64>("UserId");
				if (_userStateManager.IsReadOnly(userId))
					model.SetReadOnly();
			}
			dmv.Model = model;
			dmv.RequestView = rw;
			return dmv;
		}

		protected internal async Task Render(RequestView rwArg, TextWriter writer, ExpandoObject loadPrms, Boolean secondPhase = false)
		{
			var dmAndView = await GetDataModelForView(rwArg, loadPrms);

			IDataModel model = dmAndView.Model;
			var rw = dmAndView.RequestView;

			String rootId = "el" + Guid.NewGuid().ToString();
			String modelScript = null;

			String viewName = rw.GetView();
			if (viewName == NO_VIEW)
			{
				modelScript = await GetModelScriptModel(rw, model, rootId);
				writer.Write(modelScript);
				return;
			}

			if (_renderer == null)
				throw new InvalidOperationException("Service 'IRenderer' not registered");

			modelScript = await WriteModelScript(rw, model, rootId);
			// TODO: use view engines
			// try xaml
			String fileName = rw.GetView() + ".xaml";
			String filePath = _host.MakeFullPath(Admin, rw.Path, fileName);
			String basePath = rw.ParentModel.BasePath;
			Boolean bRendered = false;
			if (System.IO.File.Exists(filePath))
			{
				// render XAML
				if (System.IO.File.Exists(filePath))
				{
					using (var strWriter = new StringWriter())
					{
						var ri = new RenderInfo()
						{
							RootId = rootId,
							FileName = filePath,
							FileTitle = fileName,
							Path = basePath,
							Writer = strWriter,
							DataModel = model,
							Localizer = _localizer,
							CurrentLocale = null,
							IsDebugConfiguration = _host.IsDebugConfiguration,
							SecondPhase = secondPhase
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
				fileName = rw.GetView() + ".html";
				filePath = _host.MakeFullPath(Admin, rw.Path, fileName);
				if (System.IO.File.Exists(filePath))
				{
					using (_host.Profiler.CurrentRequest.Start(ProfileAction.Render, $"render: {fileName}"))
					{
						using (var tr = new StreamReader(filePath))
						{
							String htmlText = await tr.ReadToEndAsync();
							htmlText = htmlText.Replace("$(RootId)", rootId);
							writer.Write(htmlText);
							bRendered = true;
						}
					}
				}
			}
			if (!bRendered)
			{
				throw new RequestModelException($"The view '{rw.GetView()}' was not found. The following locations were searched:\n{rw.GetRelativePath(".xaml")}\n{rw.GetRelativePath(".html")}");
			}
			writer.Write(modelScript);
		}


		internal async Task<String> GetModelScriptModel(RequestView rw, IDataModel model, String rootId)
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
					templateText = CreateTemplateForWrite(_localizer.Localize(null, fileTemplateText));
				}
				dataModelText = JsonConvert.SerializeObject(model.Root, StandardSerializerSettings);
			}

const String scriptText =
@"
'use strict';
window.$currentModule = function() {
	$(RequiredModules)


	$(ModelScript)

	const rawData = $(DataModelText);
	const template = $(TemplateText);
	return {
		dataModel: modelData(template, rawData)
	};
};";
			const String emptyModel = "function modelData() {return null;}";
			var text = new StringBuilder(scriptText);
			text.Replace("$(DataModelText)", dataModelText);
			text.Replace("$(TemplateText)", _localizer.Localize(null, templateText));
			text.Replace("$(RequiredModules)", sbRequired != null ? sbRequired.ToString() : String.Empty);
			String modelScript = model !=null ? model.CreateScript(_scripter) : emptyModel;
			text.Replace("$(ModelScript)", modelScript);
			output.Append(text);
			return output.ToString();
		}

		async Task<String> WriteModelScript(RequestView rw, IDataModel model, String rootId)
		{
			StringBuilder output = new StringBuilder();
			String dataModelText = "{}";
			String templateText = "{}";
			StringBuilder sbRequired = new StringBuilder();
			// write model script
			String fileTemplateText = null;
			if (rw.template != null)
			{
				fileTemplateText = await _host.ReadTextFile(Admin, rw.Path, rw.template + ".js");
				AddRequiredModules(sbRequired, fileTemplateText);
				templateText = CreateTemplateForWrite(_localizer.Localize(null, fileTemplateText));
			}
			if (model != null)
			{
				dataModelText = JsonConvert.SerializeObject(model.Root, StandardSerializerSettings);
			}


const String scriptHeader =
@"
<script type=""text/javascript"">

'use strict';

$(RequiredModules)

(function() {
	const DataModelController = component('baseController');

	const utils = require('std:utils');
	const uPeriod = require('std:period');

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
	data: modelData(template, rawData),
	computed: {
		utils() { return utils; },
		period() { return uPeriod; }
	},
});

	vm.$data._host_ = {
		$viewModel: vm,
		$ctrl: vm.__createController__(vm)
	};

	vm.__doInit__();

})();
</script>
";
			var header = new StringBuilder(scriptHeader);
			header.Replace("$(RootId)", rootId);
			header.Replace("$(DataModelText)", dataModelText);
			header.Replace("$(TemplateText)", _localizer.Localize(null, templateText));
			header.Replace("$(RequiredModules)", sbRequired != null ? sbRequired.ToString() : String.Empty);
			output.Append(header);
			if (model == null || model.IsEmpty)
				output.Append(_scripter.CreateEmptyStript());
			else
				output.Append(model.CreateScript(_scripter));
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
			Int32 iIndex = 0;
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
				if (moduleName.ToLowerInvariant().StartsWith("app:"))
					continue;
				if (_modulesWritten.Contains(moduleName))
					continue;
				var fileName = moduleName.AddExtension("js");
				var filePath = Path.GetFullPath(Path.Combine(_host.AppPath, _host.AppKey, fileName.RemoveHeadSlash()));
				if (!File.Exists(filePath))
					throw new FileNotFoundException(filePath);
				String moduleText = File.ReadAllText(filePath);
				sb.AppendLine(tmlHeader.Replace("$(Module)", moduleName))
					.AppendLine(_localizer.Localize(null, moduleText, replaceNewLine:false))
					.AppendLine(tmlFooter)
					.AppendLine();
				_modulesWritten.Add(moduleName);
				AddRequiredModules(sb, moduleText);
			}
		}

		public static String FindModuleNameFromString(String text, ref Int32 pos)
		{
			String funcName = "require";
			Int32 rPos = text.IndexOf(funcName, pos);
			if (rPos == -1)
				return null; // не продолжаем, ничего не нашли
			pos = rPos + funcName.Length;
			// проверим, что мы не в комментарии
			Int32 oc = text.LastIndexOf("/*", rPos);
			Int32 cc = text.LastIndexOf("*/", rPos);
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
			Int32 startLine = text.LastIndexOfAny(new Char[] { '\r', '\n' }, rPos);
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
			new JsonSerializerSettings()
			{
				Formatting = Formatting.Indented,
				StringEscapeHandling = StringEscapeHandling.EscapeHtml,
				DateFormatHandling = DateFormatHandling.IsoDateFormat,
				DateTimeZoneHandling = DateTimeZoneHandling.Utc,
				NullValueHandling = NullValueHandling.Ignore,
				DefaultValueHandling = DefaultValueHandling.Ignore
			};

		public void ProfileException(Exception ex)
		{
			using (Host.Profiler.CurrentRequest.Start(ProfileAction.Exception, ex.Message))
			{
				// do nothing
			}
		}

		public void WriteScriptException(Exception ex, TextWriter writer)
		{
			if (ex.InnerException != null)
				ex = ex.InnerException;
			ProfileException(ex);
			writer.Write($"alert(`{ex.Message.Replace("\\", "\\\\").Replace("'", "\\'")}`)");
		}

		public void WriteHtmlException(Exception ex, TextWriter writer)
		{
			if (ex.InnerException != null)
				ex = ex.InnerException;
			ProfileException(ex);
			var msg = WebUtility.HtmlEncode(ex.Message);
			var stackTrace = WebUtility.HtmlEncode(ex.StackTrace);
			if (IsDebugConfiguration)
				writer.Write($"<div class=\"app-exception\"><div class=\"message\">{msg}</div><div class=\"stack-trace\">{stackTrace}</div></div>");
			else
			{
				msg = Localize("@[Error.Exception]");
				writer.Write($"<div class=\"app-exception\"><div class=\"message\">{msg}</div></div>");
			}
		}


		public void WriteExceptionStatus(Exception ex, HttpResponseBase response)
		{
			if (ex.InnerException != null)
				ex = ex.InnerException;
			ProfileException(ex);
			response.SuppressContent = false;
			response.StatusCode = 255; // CUSTOM ERROR!!!!
			response.ContentType = "text/plain";
			response.StatusDescription = "Custom server error";
			response.Write(Localize(ex.Message));
		}

		public void SendSupportEMail(String body)
		{
			if (_messageService == null)
				throw new InvalidOperationException($"Service 'IMessageService' not registered");
			String to = Host.SupportEmail;
			if (String.IsNullOrEmpty(to))
				return;
			String subject = "Feedback from service";
			_messageService.Send(to, subject, body);
		}

		void RenderErrorDialog(TextWriter writer, String message)
		{
			var errorHtml = new StringBuilder(_localizer.Localize(null, Resources.errorDialog));
			var pageGuid = $"el{Guid.NewGuid()}"; // starts with letter!
			errorHtml.Replace("$(PageGuid)", pageGuid);
			errorHtml.Replace("$(ErrorMessage)", message);
			writer.Write(errorHtml.ToString());

		}
	}
}

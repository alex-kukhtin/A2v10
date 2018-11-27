// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

using A2v10.Infrastructure;
using System.Net;
using A2v10.Data.Interfaces;
using System.Threading;
using System.Web;
using A2v10.Request.Properties;

namespace A2v10.Request
{
	public class ScriptInfo
	{
		public String Script;
		public String DataScript;
	}

	public class ViewInfo
	{
		public String PageId;
		public String Id;

		public String View;
		public String Path;
		public String BaseUrl;
		public ScriptInfo Scripts;
		public IDataModel DataModel;
	}

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

		//public const String NO_VIEW = "\b_NO_VIEW_\b";

		public Func<String, String> NormalizeBaseUrl { get; set; }

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

		/*
		public async Task RenderModel(String pathInfo, ExpandoObject loadPrms, TextWriter writer)
		{
			// TODO: delete me
			RequestModel rm = await RequestModel.CreateFromUrl(_host, Admin, RequestUrlKind.Page, pathInfo);
			RequestView rw = rm.GetCurrentAction(RequestUrlKind.Page);
			rw.view = NO_VIEW; // no view here
			await Render(rw, writer, loadPrms);
		}
		*/

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
				loadPrms.AppendIfNotExists(rw.parameters);
				if (rw.Id != null)
					loadPrms.Set("Id", rw.Id);
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
			//if (viewName == NO_VIEW)
			//{
				//modelScript = await GetModelScriptModel(rw, model, rootId);
				//writer.Write(modelScript);
				//return;
			//}

			if (_renderer == null)
				throw new InvalidOperationException("Service 'IRenderer' not registered");

			var si = await WriteModelScript(rw, model, rootId);
			modelScript = si.Script;
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

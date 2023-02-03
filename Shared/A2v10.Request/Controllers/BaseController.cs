﻿// Copyright © 2015-2022 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Net;

using A2v10.Infrastructure;
using A2v10.Data.Interfaces;
using A2v10.Request.Properties;

namespace A2v10.Request
{

	public class ViewInfo
	{
		public String PageId;
		public String Id;

		public String View;
		public String Path;
		public String BaseUrl;
		public ScriptInfo Scripts;
		public IDataModel DataModel;

		public String Params;
	}

	public class RendererInfo
	{
		public IRenderer Renderer;
		public String FileName;
		public String FilePath;
	}

	public partial class BaseController
	{
		protected readonly IServiceLocator _locator;
		protected readonly IApplicationHost _host;
		protected readonly IDbContext _dbContext;
		protected readonly IRenderer _renderer;
		protected readonly IWorkflowEngine _workflowEngine;
		protected readonly ILocalizer _localizer;
		protected readonly IDataScripter _scripter;
		protected readonly IMessageService _messageService;
		protected readonly IUserStateManager _userStateManager;
		protected readonly IExternalDataProvider _externalDataProvider;
		protected readonly ITokenProvider _tokenProvider;
		protected readonly IUserLocale _userLocale;
		protected readonly ILicenseManager _licenseManager;

		public class DataModelAndView
		{
			public IDataModel Model;
			public RequestView RequestView;
            public Boolean Index;
		}

		//public const String NO_VIEW = "\b_NO_VIEW_\b";

		public Func<String, String> NormalizeBaseUrl { get; set; }

		public BaseController(IServiceLocator currentLocator = null)
		{
			// DI ready
			_locator = currentLocator ?? ServiceLocator.Current;
			_host = _locator.GetService<IApplicationHost>();
			_dbContext = _locator.GetService<IDbContext>();
			_renderer = _locator.GetServiceOrNull<IRenderer>();
			_workflowEngine = _locator.GetServiceOrNull<IWorkflowEngine>();
			_localizer = _locator.GetService<ILocalizer>();
			_scripter = _locator.GetService<IDataScripter>();
			_messageService = _locator.GetServiceOrNull<IMessageService>();
			_userStateManager = _locator.GetServiceOrNull<IUserStateManager>();
			_externalDataProvider = _locator.GetServiceOrNull<IExternalDataProvider>();
			_tokenProvider = _locator.GetService<ITokenProvider>();
			_userLocale = _locator.GetService<IUserLocale>();
			_licenseManager = _locator.GetServiceOrNull<ILicenseManager>();
		}

		public Boolean IsDebugConfiguration => _host.IsDebugConfiguration;
		public IDbContext DbContext => _dbContext;
		public IApplicationHost Host => _host;
		public IDataScripter Scripter => _scripter;
		public IUserStateManager UserStateManager => _userStateManager;

		public Boolean Mobile => _host.Mobile;

		public Boolean Admin => _host.IsAdminMode;

		public String CurrentLang => _userLocale.Language;

		public void SetUserLocale(String locale)
		{
			_userLocale.Locale = locale;
		}

		public String Localize(String content)
		{
			return _localizer.Localize(null, content);
		}

		public async Task RenderApplicationKind(RequestUrlKind kind, String pathInfo, ExpandoObject loadPrms, TextWriter writer, Boolean isUserOpenId)
		{
			var segs = pathInfo.ToLowerInvariant().Split('/');
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
					if (isUserOpenId)
						throw new RequestModelException($"Unable to change password");
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

		void CheckLicense(RequestModel rm)
		{
			if (String.IsNullOrEmpty(rm.module))
				return;
			var lic = _userStateManager.GetLicense();
			/*
			 * CHECK LICENSE INFORMATIOn
			 */
		}

		public async Task RenderElementKind(RequestUrlKind kind, String pathInfo, ExpandoObject loadPrms, TextWriter writer)
		{
			RequestModel rm = await RequestModel.CreateFromUrl(_host, kind, pathInfo);
			CheckLicense(rm);
			RequestView rw = rm.GetCurrentAction(kind);
			rw.CheckPermissions(_userStateManager?.GetUserPermissions(), Host.IsDebugConfiguration);
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
				var rm = await RequestModel.CreateFromUrl(_host, rw.CurrentKind, targetUrl);
				rw = rm.GetCurrentAction();
				String loadProc = rw.LoadProcedure;
				if (loadProc != null)
				{
					loadPrms.Set("Id", rw.Id);
					if (rw.parameters != null)
						loadPrms.AppendIfNotExists(rw.parameters);
					var newModel = await _dbContext.LoadModelAsync(rw.CurrentSource, loadProc, loadPrms,  rw.commandTimeout);
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
				rw.viewMobile = innerModel.Root.Resolve(rw.targetModel.viewMobile);
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
					var newModel = await _dbContext.LoadModelAsync(rw.CurrentSource, loadProc, loadPrms, rw.commandTimeout);
					innerModel.Merge(newModel);
				}
			}
			return rw;
		}

		void AddMergeParameters(RequestMerge rm, IDataModel model, ExpandoObject prms)
		{
			var mp = rm.parameters;
			if (mp != null && !mp.IsEmpty())
			{
				foreach (var kv in mp)
				{
					if (kv.Value is String strVal && strVal.StartsWith("{{"))
						prms.Set(kv.Key, model.Root.Resolve(strVal));
					else
						prms.Set(kv.Key, kv.Value);
				}
			}
		}


		internal async Task<DataModelAndView> GetDataModelForView(RequestView rw, ExpandoObject initialParams)
		{
			var dmv = new DataModelAndView()
			{
				RequestView = rw,
                Index = rw.index
			};
			String loadProc = rw.LoadProcedure;


			// real params = [model.json, id, initial]
			var realParams = new ExpandoObject();
			realParams.Append(rw.parameters);
			if (rw.Id != null)
				realParams.Set("Id", rw.Id);
			realParams.Append(initialParams);

			IDataModel model = null;

			if (loadProc != null)
			{
				ExpandoObject prms2 = realParams;
				if (rw.indirect)
				{
					// for indirect - @TenantId, @UserId and @Id only
					prms2 = new ExpandoObject();
					prms2.Set("Id", rw.Id);
					if (realParams != null)
					{
						prms2.Set("UserId", realParams.Get<Int64>("UserId"));
						prms2.Set("TenantId", realParams.Get<Int32>("TenantId"));
					}
				}
				model = await _dbContext.LoadModelAsync(rw.CurrentSource, loadProc, prms2, rw.commandTimeout);
				if (rw.HasMerge)
				{
					AddMergeParameters(rw.merge, model, prms2);
					var mergeModel = await _dbContext.LoadModelAsync(rw.MergeSource, rw.MergeLoadProcedure, prms2, rw.commandTimeout);
					model.Merge(mergeModel);
				}
				if (rw.copy)
					model.MakeCopy();
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
				rw = await LoadIndirect(rw, model, realParams);
			if (model?.Root != null)
			{
				// side effect!
				rw.view = model.Root.Resolve(rw.view);
				rw.viewMobile = model.Root.Resolve(rw.viewMobile);
				rw.template = model.Root.Resolve(rw.template);
				rw.checkTypes = model.Root.Resolve(rw.checkTypes);
			}

			if (_userStateManager != null && model != null)
			{
				Int64 userId = realParams.Get<Int64>("UserId");
				if (_userStateManager.IsReadOnly(userId))
					model.SetReadOnly();
			}
			dmv.Model = model;
			dmv.RequestView = rw;
			return dmv;
		}

		private RendererInfo FindRenderer(RequestView rw)
		{
			var view = rw.GetView(_host.Mobile);
			if (view != null && view.StartsWith("clr-type:"))
			{
				return new RendererInfo()
				{
					Renderer = ClrHelpers.LoadObjectDI<IRenderer>(rw.view)
				};
			}
			String fileName = view + ".xaml";

			String filePath = _host.ApplicationReader.MakeFullPath(rw.Path, fileName);
			if (_host.ApplicationReader.FileExists(filePath))
			{
				// xamlRenderer
				return new RendererInfo()
				{
					Renderer = _renderer,
					FileName = fileName,
					FilePath = filePath
				};
			}
			fileName = view + ".html";
			filePath = _host.ApplicationReader.MakeFullPath(rw.Path, fileName);
			if (_host.ApplicationReader.FileExists(filePath))
			{
				// xamlRenderer
				return new RendererInfo()
				{
					Renderer = new HtmlRenderer(_localizer, _host),
					FileName = fileName,
					FilePath = filePath
				};
			}
			return null;
		}

		protected internal async Task Render(RequestView rwArg, TextWriter writer, ExpandoObject loadPrms, Boolean secondPhase = false)
		{
			var dmAndView = await GetDataModelForView(rwArg, loadPrms);

			IDataModel model = dmAndView.Model;
			var rw = dmAndView.RequestView;

			String rootId = "el" + Guid.NewGuid().ToString();

			if (_renderer == null)
				throw new InvalidOperationException("Service 'IRenderer' not registered");

			var typeChecker = _host.CheckTypes(rw.Path, rw.checkTypes, model);


			var msi = new ModelScriptInfo()
			{
				DataModel = model,
				RootId = rootId,
				IsDialog = rw.IsDialog,
				IsIndex = rw.index,
				IsSkipDataStack = rw.skipDataStack,
				Template = rw.template,
				Path = rw.Path,
				BaseUrl = rw.ParentModel.BasePath
			};
			var si = await _scripter.GetModelScript(msi);

			String modelScript = si.Script;

			Boolean bRendered = false;
			String basePath = rw.ParentModel.BasePath;

			RendererInfo rendererInfo = FindRenderer(rw);
			if (rendererInfo != null)
			{
				using var strWriter = new StringWriter();
				var ri = new RenderInfo()
				{
					RootId = rootId,
					FileName = rendererInfo.FilePath,
					FileTitle = rendererInfo.FileName,
					Path = basePath,
					Writer = strWriter,
					DataModel = model,
					Localizer = _localizer,
					TypeChecker = typeChecker,
					CurrentLocale = null,
					IsDebugConfiguration = _host.IsDebugConfiguration,
					SecondPhase = secondPhase
				};
				rendererInfo.Renderer.Render(ri);
				// write markup
				writer.Write(strWriter.ToString());
				bRendered = true;
			}

			if (!bRendered)
			{
				throw new RequestModelException($"The view '{rw.GetView(_host.Mobile)}' was not found. The following locations were searched:\n{rw.GetRelativePath(".xaml", _host.Mobile)}\n{rw.GetRelativePath(".html", _host.Mobile)}");
			}
			await ProcessDbEvents(rw);
			writer.Write(modelScript);
		}

		public Task ProcessDbEvents(RequestBase rb)
		{
			if (!rb.processDbEvents)
				return Task.CompletedTask;
			return _host.ProcessDbEvents(_dbContext, rb.CurrentSource);
		}

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
				var link = Localize("@[Error.Link]");
				writer.Write($"<div class=\"app-exception\"><div class=message>{msg}</div><a class=link href=\"/\">{@link}</a></div>");
			}
		}

		public void WriteExceptionStatus(Exception ex, HttpResponseBase response, Int32 errorCode = 0)
		{
			if (ex.InnerException != null)
				ex = ex.InnerException;
			if (errorCode == 0)
				errorCode = 255;
			ProfileException(ex);
			response.SuppressContent = false;
			response.StatusCode = errorCode; // CUSTOM ERROR!!!!
			response.ContentType = "text/plain";
			response.StatusDescription = "Server error";
			response.Write(Localize(ex.Message));
		}

		public async Task SendSupportEMailAsync(String body)
		{
			if (_messageService == null)
				throw new InvalidOperationException($"Service 'IMessageService' not registered");
			String to = Host.SupportEmail;
			if (String.IsNullOrEmpty(to))
				return;
			String subject = "Feedback from service";
			var msginfo = _messageService.CreateSendInfo();
			msginfo.Subject = subject;
			msginfo.Body = body;
			msginfo.AddTo(to);
			await _messageService.SendAsync(msginfo);
		}

		void RenderErrorDialog(TextWriter writer, String message)
		{
			var errorHtml = new StringBuilder(_localizer.Localize(null, Resources.errorDialog));
			var pageGuid = $"el{Guid.NewGuid()}"; // starts with letter!
			errorHtml.Replace("$(PageGuid)", pageGuid);
			errorHtml.Replace("$(ErrorMessage)", message);
			writer.Write(errorHtml.ToString());

		}

		public async Task Server(String command, String baseUrl, Int64 userId, HttpResponseBase response)
		{
			var rm = await RequestModel.CreateFromBaseUrl(_host, baseUrl);
			RequestView rw = rm.GetCurrentAction();
			String loadProc = rw.LoadProcedure;
			if (loadProc == null)
				throw new RequestModelException("The data model is empty");
			var prms = new ExpandoObject();
			prms.Set("UserId", userId);
			prms.Set("Id", rw.Id);
			IDataModel model = await _dbContext.LoadModelAsync(rw.CurrentSource, loadProc, prms, rw.commandTimeout);

			var msi = new ModelScriptInfo()
			{
				DataModel = model,
				Template = rw.template,
				Path = rw.Path
			};
			var ss = _scripter.GetServerScript(msi);

			response.ContentType = "text/javascript";
			response.Write(ss.Script);
		}
	}
}

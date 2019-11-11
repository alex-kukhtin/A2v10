// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Globalization;

using ChakraHost.Hosting;

using A2v10.Runtime.Properties;
using A2v10.Script;
using A2v10.Request;
using A2v10.Runtime;
using A2v10.Xaml;
using A2v10.Workflow;
using A2v10.Data.Interfaces;
using A2v10.Data;
using A2v10.Infrastructure;

namespace A2v10RuntimeNet
{
	public static class Desktop
	{
		static IScriptContext _scriptContext;

		static IServiceLocator _currentService;

		public static Boolean HasError { get; set; }
		public static String LastErrorMessage { get; set; }

		public static void Start()
		{
			TryCatch(() =>
			{
				Resources.Culture = CultureInfo.InvariantCulture;
				ScriptContext.Start();
			});
		}

		public static void Stop()
		{
			if (_scriptContext == null)
				return;
			(_scriptContext as IDisposable).Dispose();
		}

		public static void LoadRuntimeLibrary()
		{
			String[] app =
			{
				Resources.Application,
				Resources.Form_form,
				Resources.Solution
			};
			ParseLibraryElements(app);
		}

		public static void LoadModuleContext()
		{
			String[] app =
			{
				Resources.Application,
				Resources.App_context,
				Resources.Solution
			};
			ParseLibraryElements(app);
		}

		static IScriptContext ScriptContext
		{
			get
			{
				if (_scriptContext == null)
					_scriptContext = new ScriptContext();
				return _scriptContext;
			}
		}

		static void ClearError()
		{
			HasError = false;
			LastErrorMessage = null;
		}

		static void SetLastError(Exception ex)
		{
			HasError = true;
			if (ex is JavaScriptScriptException)
			{
				var jsex = (ex as JavaScriptScriptException);
				LastErrorMessage = jsex.Error.GetProperty(JavaScriptPropertyId.FromString("message")).ConvertToString().ToString();
			}
			else
			{
				LastErrorMessage = ex.Message;
			}
		}

		static void ParseLibraryElements(String[] elems)
		{
			foreach (var elem in elems)
			{
				var lib = JavaScriptContext.ParseScriptLibrary(elem);
				lib.CallFunction(JavaScriptValue.Undefined);
			}
		}

		public static void TryCatch(Action doAction)
		{
			ClearError();
			try
			{
				doAction();
			}
			catch (Exception ex)
			{
				SetLastError(ex);
			}
		}

		public static void OpenSolution(String fileName)
		{
			TryCatch(() =>
			{
				throw new Exception($"opens file {fileName} (from C#)");
			});
		}

		public static void StartDesktopServices()
		{
			// TODO: LOCALE
			CultureInfo.DefaultThreadCurrentUICulture = new CultureInfo("uk-UA");

			ServiceLocator.GetCurrentLocator = () =>
			{
				if (_currentService == null)
					_currentService = new ServiceLocator();
				return _currentService;
			};

			ServiceLocator.Start = (IServiceLocator service) =>
			{
				IProfiler profiler = new DesktopProfiler();
				DesktopApplicationHost host = new DesktopApplicationHost(profiler);
				ILocalizer localizer = new DesktopLocalizer(host);
				IDbContext dbContext = new SqlDbContext(
					profiler as IDataProfiler,
					host as IDataConfiguration,
					localizer as IDataLocalizer,
					tenantManager: null); /*host as ITenantManager*/
				IRenderer renderer = new XamlRenderer(profiler, host);
				IWorkflowEngine wfEngine = new WorkflowEngine(host, dbContext, null);
				IDataScripter scripter = new VueDataScripter(host, localizer);
				IUserStateManager userStateManager = new DesktopUserStateManager(host, dbContext);
				service.RegisterService<IProfiler>(profiler);
				service.RegisterService<IApplicationHost>(host);
				service.RegisterService<IDbContext>(dbContext);
				service.RegisterService<IRenderer>(renderer);
				service.RegisterService<IWorkflowEngine>(wfEngine);
				service.RegisterService<IDataScripter>(scripter);
				service.RegisterService<ILocalizer>(localizer);
				service.RegisterService<IUserStateManager>(userStateManager);
				service.RegisterService<ISupportUserInfo>(host);
				host.TenantId = 1;
			};
		}

		static String _lastMime = String.Empty;
		static String _lastContentDisposition = String.Empty;
		static Int32 _lastStatusCode = 0;

		public static String GetLastMime()
		{
			return _lastMime;
		}

		public static String GetLastContentDisposition()
		{
			return _lastContentDisposition;
		}

		public static Int32 GetLastStatusCode()
		{
			return _lastStatusCode;
		}

		public static Byte[] ProcessRequest(String url, String search, Byte[] post, Boolean postMethod)
		{
			_lastContentDisposition = String.Empty;
			_lastMime = String.Empty;
			var dr = new DesktopRequest();
			var result = dr.ProcessRequest(url, search, post, postMethod);
			_lastMime = dr.MimeType;
			_lastContentDisposition = dr.ContentDisposition ?? String.Empty;
			_lastStatusCode = dr.StatusCode;
			return result;
		}

		public static Byte[] UploadFiles(String url, String files)
		{
			_lastMime = String.Empty;
			var dr = new DesktopRequest();
			var result = dr.UploadFiles(url, files);
			_lastMime = dr.MimeType;
			return result;
		}

		public static void StartApplication(String cnnString)
		{
			TryCatch(() => DesktopApplicationHost.StartApplication(cnnString));
		}
	}
}

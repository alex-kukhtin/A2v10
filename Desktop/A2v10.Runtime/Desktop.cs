using A2v10.Infrastructure;
using A2v10.Runtime.Properties;
using A2v10.Script;
using A2v10.Request;
using ChakraHost.Hosting;
using System;
using System.Globalization;
using System.IO;

namespace A2v10RuntimeNet
{
    public static class Desktop
    {
		static IScriptContext _scriptContext;

		public static bool HasError { get; set; }
		public static String LastErrorMessage { get; set; }

		public static void Start()
		{
			try
			{
				Resources.Culture = CultureInfo.InvariantCulture;
				ScriptContext.Start();
			}
			catch (Exception ex)
			{
				SetLastError(ex);
			}
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
                Resources.App_context,
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

        public static void OpenSolution(String fileName)
        {
            try
            {
                throw new Exception($"opens file {fileName} (from C#)");
            }
            catch (Exception ex)
            {
                SetLastError(ex);
            }
        }

        public static String ProcessRequest(String url)
        {
            try
            {
                var ctrl = new BaseController();
                using (var writer = new StringWriter()) {
                    ctrl.RenderElementKind(RequestUrlKind.Page, url, null, writer).Wait();
                    return writer.ToString();
                }
                return $"<div>page '{url}' not found.</div>";
            }
            catch (Exception ex)
            {
                //SetLastError(ex);
                if (ex.InnerException != null)
                    ex = ex.InnerException;
                return $"<div>{ex.Message}</div>";
            }
        }
	}
}

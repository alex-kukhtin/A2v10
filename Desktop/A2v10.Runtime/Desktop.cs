using A2v10.Infrastructure;
using A2v10.Script;
using ChakraHost.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
				ScriptContext.Start();
			}
			catch (Exception ex)
			{
				SetLastError(ex);
			}
		}

		public static void Stop()
		{
			(_scriptContext as IDisposable).Dispose();
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
	}
}

using System;
using System.Configuration;

using ChakraHost.Hosting;

using A2v10.Infrastructure;

namespace A2v10.Script.JSRT
{
	public class ScriptContext : IScriptContext, IDisposable
	{
		JavaScriptRuntime _runtime;
		JavaScriptContext _context = JavaScriptContext.Invalid;
		JavaScriptContext.Scope _scope;

		#region IScriptContext
		public void Start()
		{
			if (IsValid)
				return;
			_runtime = JavaScriptRuntime.Create();
			CreateContext();
		}

		public void LoadLibrary(String script)
		{
			try
			{
				JavaScriptValue jsLib = JavaScriptContext.ParseScript(script);
				if (jsLib.ValueType == JavaScriptValueType.Function)
					jsLib.CallFunction(JavaScriptValue.Undefined);
			}
			catch (JavaScriptScriptException ex)
			{
				var msg = ex.Error.GetProperty(JavaScriptPropertyId.FromString("message"));
				throw new JSRuntimeException(msg.ToString());
			}
			catch (Exception)
			{
				throw;
			}
		}

		public void RunScript(String script)
		{
			try
			{
				JavaScriptValue jsScript = JavaScriptContext.ParseScript(script);
				if (jsScript.ValueType == JavaScriptValueType.Function)
				{
					var jsResult = jsScript.CallFunction(JavaScriptValue.Undefined);
					Int32 z = 44;
				}
			}
			catch (JavaScriptScriptException ex)
			{
				var msg = ex.Error.GetProperty(JavaScriptPropertyId.FromString("message"));
				throw new JSRuntimeException(msg.ToString());
			}
			catch (Exception)
			{
				throw;
			}
		}

		public Boolean IsValid { get { return _runtime.IsValid; } }
		#endregion

		#region IDisposable
		public void Dispose()
		{
			if (!IsValid)
				return;
			try
			{
				if (_context.IsValid && JavaScriptContext.HasException)
					JavaScriptContext.GetAndClearException();
				_scope.Dispose();
				_runtime.Dispose();

			}
			catch (Exception)
			{
				// eat all
			}
		}
		#endregion

		void CreateContext()
		{
			_context = _runtime.CreateContext();
			_scope = new JavaScriptContext.Scope(_context);
			_runtime.StartDebugging();
		}

		public static Boolean IsDebugConfiguration
		{
			get
			{
				String config = ConfigurationManager.AppSettings["configuration"];
				return (config != null) && (config.ToLower() == "debug");
			}
		}
	}
}

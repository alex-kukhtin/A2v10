using System;
using System.Configuration;

using ChakraHost.Hosting;

using A2v10.Infrastructure;
using Newtonsoft.Json;

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

		Object JavaScriptValueToObject(JavaScriptValue val)
		{
			switch (val.ValueType)
			{
				case JavaScriptValueType.String:
					return val.ToString();
				case JavaScriptValueType.Null:
				case JavaScriptValueType.Undefined:
					return null;
			}
			throw new InvalidCastException($"JavaScriptValueToObject. Unknown value type: {val.ValueType}");
		}

		JavaScriptValue ObjectToJavaScriptValue(Object parameter)
		{
			if (parameter == null)
				return JavaScriptValue.Null;
			else if (parameter is String)
				return JavaScriptValue.FromString(parameter.ToString());
			else if (parameter is Boolean)
				return JavaScriptValue.FromBoolean((Boolean)parameter);
			else if (parameter is Int32)
				return JavaScriptValue.FromInt32((Int32)parameter);
			else if (parameter is Double)
				return JavaScriptValue.FromDouble((Int32)parameter);
			else if (parameter is Object)
			{
				String json = JsonConvert.SerializeObject(parameter);
				var glob = JavaScriptValue.GlobalObject.GetProperty(JavaScriptPropertyId.FromString("JSON"));
				var parse = glob.GetProperty(JavaScriptPropertyId.FromString("parse"));
				return parse.CallFunction(JavaScriptValue.Undefined, JavaScriptValue.FromString(json));
			}
			return JavaScriptValue.Undefined;
		}

		public Object RunScript(String script, Object parameter)
		{
			try
			{
				JavaScriptValue jsScript = JavaScriptContext.ParseScript(script);
				if (jsScript.ValueType == JavaScriptValueType.Function)
				{
					var jsResult = jsScript.CallFunction(JavaScriptValue.Undefined);
					if (jsResult.ValueType == JavaScriptValueType.Function)
						jsResult = jsResult.CallFunction(JavaScriptValue.Undefined, ObjectToJavaScriptValue(parameter));
					return JavaScriptValueToObject(jsResult);
				}
				return null;
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
			if (IsDebugConfiguration)
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

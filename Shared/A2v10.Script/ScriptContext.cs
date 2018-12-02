// Copyright © 2012-2017 Alex Kukhtin. All rights reserved.

using System;
using ChakraHost.Hosting;

using A2v10.Infrastructure;

namespace A2v10.Script
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
				JavaScriptValue jsLib = JavaScriptContext.ParseScriptLibrary(script);
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
				case JavaScriptValueType.Undefined :
					return null;
			}
			throw new InvalidCastException($"JavaScriptValueToObject. Unknown value type: {val.ValueType}");
		}

		public Object RunScript(String script)
		{
			try
			{
				JavaScriptValue jsScript = JavaScriptContext.ParseScript(script);
				if (jsScript.ValueType == JavaScriptValueType.Function)
				{
					var jsResult = jsScript.CallFunction(JavaScriptValue.Undefined);
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
		}
	}
}

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
			JavaScriptValue jsLib = JavaScriptContext.ParseScriptLibrary(script);
			if (jsLib.ValueType == JavaScriptValueType.Function)
				jsLib.CallFunction(JavaScriptValue.Undefined);
		}

		public void RunScript(String script)
		{
			JavaScriptValue jsScript = JavaScriptContext.ParseScript(script);
			if (jsScript.ValueType == JavaScriptValueType.Function)
			{
				var jsResult = jsScript.CallFunction(JavaScriptValue.Undefined);
				int z = 44;
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

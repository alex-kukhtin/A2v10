using System;
using System.Configuration;

using ChakraHostRT.Hosting;

using A2v10.Infrastructure;

namespace A2v10.Script.JSRT
{
	public class JSScriptContext : IScriptContext, IDisposable
	{
		JavaScriptRuntime _runtime;
		JavaScriptContext _context;
		JavaScriptContext _prevContext;

		#region IDisposable
		public void Dispose()
		{
			if (!_runtime.IsValid)
				return;
			StopScript();
		}

		void StopScript()
		{
			if (_debugger != null)
			{
				_debugger.Release();
				_debugger = null;
			}
			if (!_runtime.IsValid)
				return;
			var threadId = System.Threading.Thread.CurrentThread.ManagedThreadId;
			System.Diagnostics.Trace.WriteLine($"stop: {threadId}");
			try
			{
				if (_context.IsValid && JavaScriptContext.HasException)
					JavaScriptContext.GetAndClearException();
				if (_context.IsValid)
				{
					var glob = JavaScriptValue.GlobalObject;
					glob.DeleteProperty(JavaScriptPropertyId.FromString("__invoke"), true);
					JavaScriptContext.Current = _prevContext;
				}
				_runtime.Dispose();
			}
			catch (Exception ex)
			{
				// eat all exceptions here
				String msg = ex.Message;
				System.Diagnostics.Trace.WriteLine($"stop exception: {msg}");
			}
			try
			{
				if (_runtime.IsValid)
					_runtime.Dispose();
			}
			catch (Exception ex)
			{
				// eat all exceptions here
				String msg = ex.Message;
				System.Diagnostics.Trace.WriteLine($"stop exception: {msg}");
			}
		}
		#endregion

		#region IScriptContext

		public Boolean IsValid { get { return _runtime.IsValid; } }

		public void Start()
		{
			if (_runtime.IsValid)
				return;
			var threadId = System.Threading.Thread.CurrentThread.ManagedThreadId;
			System.Diagnostics.Trace.WriteLine($"start: {threadId}");
			_runtime = JavaScriptRuntime.Create(JavaScriptRuntimeAttributes.DisableBackgroundWork | JavaScriptRuntimeAttributes.AllowScriptInterrupt, JavaScriptRuntimeVersion.Version11);
			_context = _runtime.CreateContext();
			_prevContext = JavaScriptContext.Current;
			JavaScriptContext.Current = _context;

			//CreateGlobal();
		}

		public void LoadLibrary(String script)
		{
			JavaScriptValue jsLib = JavaScriptContext.ParseScript(script);
		}


		public void RunScript(String script)
		{
			JavaScriptValue jsScript = JavaScriptContext.ParseScript(script);
		}

		public void Stop()
		{
			StopScript();
		}

		public void StartDebugging()
		{
			if (!IsDebugConfiguration)
				return;
			if (_debugger == null)
				_debugger = new JSDebugger();
			_debugger.Create();
			_debugger.StartDebugging();
		}

		JavaScriptSourceContext sourceContext = new JavaScriptSourceContext();

		public String RunScript(String code, String data, String action, String arg)
		{
			if (!IsValid)
				throw new JavaScriptException(JavaScriptErrorCode.NoCurrentContext);
			JavaScriptValue runtimeFunc = JavaScriptValue.Undefined;
			JavaScriptValue codeFunc = JavaScriptValue.Undefined;
			JavaScriptValue dataFunc = JavaScriptValue.Undefined;
			/*
			var appPath = Path.Combine(HostingEnvironment.ApplicationPhysicalPath, @"Scripts\Server\application.js");
			String appCode = System.IO.File.ReadAllText(appPath);

			JavaScriptContext.RunScript(appCode, ++sourceContext, "application");

			var scriptPath = Path.Combine(HostingEnvironment.ApplicationPhysicalPath, @"Scripts\Server\runtime.js");
			String runtimeCode = System.IO.File.ReadAllText(scriptPath);
			runtimeFunc = JavaScriptContext.ParseScript(runtimeCode, ++sourceContext, "library");
			if (!String.IsNullOrEmpty(code))
				codeFunc = JavaScriptContext.ParseScript(code, ++sourceContext, "template");
			if (!String.IsNullOrEmpty(data))
				dataFunc = JavaScriptContext.ParseScript(data, ++sourceContext, "data");
			var outerRuntime = runtimeFunc.CallFunction(JavaScriptValue.Undefined);
			if (codeFunc.IsValid && codeFunc.ValueType == JavaScriptValueType.Function)
			{
				codeFunc = codeFunc.CallFunction(JavaScriptValue.Undefined);
				if (codeFunc.ValueType != JavaScriptValueType.Function)
					throw new InvalidProgramException("unknown code function");
			}
			if (dataFunc.IsValid && dataFunc.ValueType == JavaScriptValueType.Function)
			{
				dataFunc = dataFunc.CallFunction(JavaScriptValue.Undefined);
				if (dataFunc.ValueType != JavaScriptValueType.Function)
					throw new InvalidProgramException("unknown data function");
			}
			if (outerRuntime.IsValid && outerRuntime.ValueType == JavaScriptValueType.Function)
			{
				var result = outerRuntime.CallFunction(JavaScriptValue.Undefined, codeFunc, dataFunc, JavaScriptValue.FromString(action ?? String.Empty), JavaScriptValue.FromString(arg ?? String.Empty));
				if ((result.ValueType == JavaScriptValueType.Null) || (result.ValueType == JavaScriptValueType.Undefined))
					return null;
				return result.ToString();
			}
			*/
			return null;
		}
		#endregion


		JSDebugger _debugger = null;

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

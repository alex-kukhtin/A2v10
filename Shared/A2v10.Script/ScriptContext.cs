using A2v10.Infrastructure;
using ChakraHost.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
			catch (Exception )
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

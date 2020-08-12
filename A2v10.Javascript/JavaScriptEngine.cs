// Copyright © 2019-2020 Alex Kukhtin. All rights reserved.

using System;
using Jint;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using System.IO;
using Jint.Native;
using Jint.Runtime;

namespace A2v10.Javascript
{

	public class JavaScriptEngine : IJavaScriptEngine
	{

		private readonly Lazy<Engine> _engine = new Lazy<Engine>(CreateEngine, isThreadSafe: true);
		private ScriptEnvironment _env;

		private readonly IDbContext _dbContext;
		private readonly IApplicationHost _host;

		private String _currentDirectory;

		public JavaScriptEngine(IDbContext dbContext, IApplicationHost host)
		{
			_dbContext = dbContext;
			_host = host;
		}

		public static Engine CreateEngine()
		{
			return new Engine(EngineOptions);
		}

		public static void EngineOptions(Options opts)
		{
			opts.Strict(true);
		}

		public ScriptEnvironment Environment()
		{
			if (_env == null)
				_env = new ScriptEnvironment(_engine.Value, _dbContext, _host);
			return _env;
		}

		public void SetCurrentDirectory(String dirName)
		{
			_currentDirectory = dirName;
		}

		public Object Execute(String script, params Object[] prms)
		{
			var eng = _engine.Value;

			var hdr = "const module = {exports:null }; (function() {";
			var ftr = "})(); return module.exports";

			var func = eng.Execute(hdr + script + ftr).GetCompletionValue();

			var result = eng.Invoke(func, Environment(), prms);

			return result.ToObject();
		}
	}
}

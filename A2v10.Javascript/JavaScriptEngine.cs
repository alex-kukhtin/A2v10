// Copyright © 2019-2020 Alex Kukhtin. All rights reserved.

using System;
using Jint;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;

namespace A2v10.Javascript
{

	public class JavaScriptEngine : IJavaScriptEngine
	{

		private readonly Lazy<Engine> _engine = new Lazy<Engine>(CreateEngine, isThreadSafe: true);
		private ScriptEnvironment _env;

		private readonly IDbContext _dbContext;
		private readonly IHttpService _httpService;
		private readonly IApplicationHost _host;

		public JavaScriptEngine(IDbContext dbContext, IHttpService httpService, IApplicationHost host)
		{
			_dbContext = dbContext;
			_httpService = httpService;
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
				_env = new ScriptEnvironment(_engine.Value, _dbContext, _httpService, _host);
			return _env;
		}

		public Object Execute(String script, Object prms)
		{
			var eng = _engine.Value;

			var hdr = "var module = {exports:null }; (function() {";
			var ftr = "})(); return module.exports";

			var func = eng.Execute(hdr + script + ftr).GetCompletionValue();

			var args = new Object[] { prms };
			var result = eng.Invoke(func, Environment(), args);

			return result.ToObject();
		}
	}
}

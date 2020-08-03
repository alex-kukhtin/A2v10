// Copyright © 2019-2020 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using Jint;
using Jint.Runtime;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;

namespace A2v10.Javascript
{

	public class ScriptEnvironment
	{
		private readonly IDbContext _dbContext;
		private readonly Engine _engine;

		public ScriptEnvironment(Engine engine, IDbContext dbContext)
		{
			_engine = engine;
			_dbContext = dbContext;
		}

#pragma warning disable IDE1006 // Naming Styles
		public ExpandoObject loadModel(ExpandoObject prms)
		{
			try
			{
				String source = prms.Get<String>("source");
				String command = prms.Get<String>("procedure");
				ExpandoObject dmParams = prms.Get<ExpandoObject>("parameters");
				var dm = _dbContext.LoadModel(source, command, dmParams);
				return dm.Root;
			}
			catch (Exception ex)
			{
				if (ex.InnerException != null)
					ex = ex.InnerException;
				var js = new Jint.Native.JsString(ex.Message);
				throw new JavaScriptException(js);
			}
		}

		public ExpandoObject callHttpApi(ExpandoObject prms)
		{
			return prms;
		}
#pragma warning restore IDE1006 // Naming Styles
	}

	public class JavaScriptEngine : IJavaScriptEngine
	{

		private readonly Lazy<Engine> _engine = new Lazy<Engine>(CreateEngine, isThreadSafe: true);
		private ScriptEnvironment _env;

		private readonly IDbContext _dbContext;
		private readonly IHttpService _httpService;

		public JavaScriptEngine(IDbContext dbContext, IHttpService httpService)
		{
			_dbContext = dbContext;
			_httpService = httpService;
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
				_env = new ScriptEnvironment(_engine.Value, _dbContext);
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

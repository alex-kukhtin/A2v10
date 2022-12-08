// Copyright © 2019-2022 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;


using Newtonsoft.Json;
using Jint;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;

namespace A2v10.Javascript;

public class JavaScriptEngine : IJavaScriptEngine
{

	private readonly Lazy<Engine> _engine = new(CreateEngine, isThreadSafe: true);
	private ScriptEnvironment _env;

	private readonly IDbContext _dbContext;
	private readonly IApplicationHost _host;
	private readonly ISmsService _smsService;
	private readonly IServiceLocator _locator;

	private String _currentDirectory;

	public JavaScriptEngine(IDbContext dbContext, IApplicationHost host, ISmsService smsService, IServiceLocator locator)
	{
		_dbContext = dbContext;
		_host = host;
		_smsService = smsService;
		_locator = locator;
	}

	public static Engine CreateEngine()
	{
		return new Engine(EngineOptions);
	}

	public static void EngineOptions(Options opts)
	{
		opts.Strict(true);
		// opts.CatchClrExceptions(ex => true);
	}

	public ScriptEnvironment Environment()
	{
		_env ??= new ScriptEnvironment(_engine.Value, _locator, _dbContext, _host, _smsService, _currentDirectory);
		return _env;
	}

	public void SetCurrentDirectory(String dirName)
	{
		_currentDirectory = dirName;
	}

	public Object Execute(String script, ExpandoObject prms, ExpandoObject args)
	{
		var eng = _engine.Value;

		var strPrms = JsonConvert.ToString(JsonConvert.SerializeObject(prms), '\'', StringEscapeHandling.Default);
		var strArgs = JsonConvert.ToString(JsonConvert.SerializeObject(args), '\'', StringEscapeHandling.Default);

		String code = $@"
return (function() {{
const __params__ = JSON.parse({strPrms});
const __args__ = JSON.parse({strArgs});
const module = {{exports:null }};

{script};

const __exp__ = module.exports;

return function(_this) {{
	return __exp__.call(_this, __params__, __args__);
}};

}})();";


		var func = eng.Evaluate(code);

		var result = eng.Invoke(func, Environment());

		return result.ToObject();
	}
}

// Copyright © 2019-2023 Oleksandr Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.Text;
using System.Security.Cryptography;

using Jint;
using Jint.Native;
using Jint.Runtime.Interop;

using Newtonsoft.Json;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;

namespace A2v10.Javascript;

public class ScriptEnvironment
{
	private readonly IDbContext _dbContext;
	private readonly Engine _engine;
	private readonly ScriptConfig _config;
	private readonly ScriptUser _currentUser;
	private readonly ISmsService _smsService;
	private readonly IApplicationHost _host;
	private readonly IServiceLocator _locator;
	private readonly String _currentDir;

	public ScriptEnvironment(Engine engine, IServiceLocator locator, IDbContext dbContext, IApplicationHost host, ISmsService smsService, String currentDir)
	{
		_engine = engine;
		_dbContext = dbContext;
		_config = new ScriptConfig(host);
		_smsService = smsService;
		_host = host;
		_currentDir = currentDir;
		_locator = locator;
		_currentUser = new ScriptUser(_host);
	}

#pragma warning disable IDE1006 // Naming Styles
	public ScriptConfig config => _config;
	public ScriptUser currentUser => _currentUser;

	public ExpandoObject loadModel(ExpandoObject prms)
	{
		String source = prms.Get<String>("source");
		String command = prms.Get<String>("procedure");
		ExpandoObject dmParams = prms.Get<ExpandoObject>("parameters");
		var dm = _dbContext.LoadModel(source, command, dmParams);
		return dm.Root;
	}

	public ExpandoObject saveModel(ExpandoObject prms)
	{
		String source = prms.Get<String>("source");
		String command = prms.Get<String>("procedure");
		ExpandoObject data = prms.Get<ExpandoObject>("data");
		ExpandoObject dmParams = prms.Get<ExpandoObject>("parameters");
		var dm = _dbContext.SaveModel(source, command, data, dmParams);
		return dm.Root;
	}

	public ExpandoObject executeSql(ExpandoObject prms)
	{
		String source = prms.Get<String>("source");
		String command = prms.Get<String>("procedure");
		ExpandoObject dmParams = prms.Get<ExpandoObject>("parameters");
		return _dbContext.ExecuteAndLoadExpando(source, command, dmParams);
	}

	public FetchResponse fetch(String url)
	{
		return fetch(url, null);
	}

	public FetchResponse fetch(String url, ExpandoObject prms)
	{
		return new FetchCommand().Execute(url, prms);
	}

	public ExpandoObject queueTask(String command, ExpandoObject prms, DateTime? runAt = null)
	{
		var dbParams = new ExpandoObject()
		{
			{ "Command", command },
			{ "UtcRunAt", runAt  },
			{ "Data", prms != null ? JsonConvert.SerializeObject(prms) : null }
		};
		return _dbContext.ExecuteAndLoadExpando(null, "a2bg.[Command.Queue]", dbParams);
	}

	public SendSmsResponse sendSms(String phone, String message, String extId)
	{
		return new SendSmsCommand(_smsService).Execute(phone, message, extId);
	}

	public FetchResponse invokeCommand(String cmd, String baseUrl, ExpandoObject parameters)
	{
		return new InvokeCommand(_locator).Execute(cmd, baseUrl, parameters);
	}

	public String toBase64(String source, int codePage, bool safe)
	{
		var enc = Encoding.GetEncoding(codePage, new EncoderReplacementFallback(String.Empty), DecoderFallback.ReplacementFallback);
		var bytes = enc.GetBytes(source);
		var res = Convert.ToBase64String(bytes);
		if (safe)
			res = res.Replace('+', '-').Replace('/', '_').TrimEnd('=');
		return res;
	}

	public String generateApiKey()
	{
		Int32 size = 48;
		using (var provider = new RNGCryptoServiceProvider())
		{
			Byte[] data = new Byte[size];
			provider.GetNonZeroBytes(data);
			String res = Convert.ToBase64String(data);
			res = res.Remove(res.Length - 2);
			return res;
		}
	}

	public JsValue require(String fileName, ExpandoObject prms, ExpandoObject args)
	{
		var script = _host.ApplicationReader.ReadTextFile(_currentDir, fileName);

		String code = $@"
return (function() {{
const module = {{exports:null }};
{script};
const __exp__ = module.exports;
return function(_this, prms, args) {{
	return __exp__.call(_this, prms, args);
}};
}})();";
		var func = _engine.Evaluate(code);
		return _engine.Invoke(func, this, prms, args);
	}

	public JsValue createObject(String name, ExpandoObject prms)
	{
		switch (name)
		{
			case "KsSmsSender":
				return new ObjectWrapper(_engine, new KsSmsSender(_locator, prms));
		}
		return null;
	}
#pragma warning restore IDE1006 // Naming Styles
}

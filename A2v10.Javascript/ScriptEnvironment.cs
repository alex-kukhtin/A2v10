// Copyright © 2019-2021 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;

using Jint;
using Jint.Native;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using System.Text;

namespace A2v10.Javascript
{
	public class ScriptEnvironment
	{
		private readonly IDbContext _dbContext;
		private readonly Engine _engine;
		private readonly ScriptConfig _config;
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
		}

#pragma warning disable IDE1006 // Naming Styles
		public ScriptConfig config => _config;

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


		public SendSmsResponse sendSms(String phone, String message, String extId)
		{
			return new SendSmsCommand(_smsService).Execute(phone, message, extId);
		}

		public FetchResponse invokeCommand(String cmd, String baseUrl, ExpandoObject parameters)
		{
			return new InvokeCommand(_locator).Execute(cmd, baseUrl, parameters);
		}

		public String toBase64(String source, int codePage)
		{
			var bytes = Encoding.GetEncoding(codePage).GetBytes(source);
			return Convert.ToBase64String(bytes);
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
#pragma warning restore IDE1006 // Naming Styles
	}
}

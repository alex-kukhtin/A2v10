// Copyright © 2019-2021 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;

using Jint;
using Jint.Runtime;
using Jint.Native;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;

namespace A2v10.Javascript
{
	public class ScriptEnvironment
	{
		private readonly IDbContext _dbContext;
		private readonly Engine _engine;
		private readonly ScriptConfig _config;

		public ScriptEnvironment(Engine engine, IDbContext dbContext, IApplicationHost host)
		{
			_engine = engine;
			_dbContext = dbContext;
			_config = new ScriptConfig(host);
		}

#pragma warning disable IDE1006 // Naming Styles
		public ScriptConfig config => _config;
#pragma warning restore IDE1006 // Naming Styles

#pragma warning disable IDE1006 // Naming Styles
		public ExpandoObject loadModel(ExpandoObject prms)
#pragma warning restore IDE1006 // Naming Styles
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
				var js = new JsString(ex.Message);
				throw new JavaScriptException(js);
			}
		}

#pragma warning disable IDE1006 // Naming Styles
		public ExpandoObject saveModel(ExpandoObject prms)
#pragma warning restore IDE1006 // Naming Styles
		{
			try
			{
				String source = prms.Get<String>("source");
				String command = prms.Get<String>("procedure");
				ExpandoObject data = prms.Get<ExpandoObject>("data");
				ExpandoObject dmParams = prms.Get<ExpandoObject>("parameters");
				var dm = _dbContext.SaveModel(source, command, data, dmParams);
				return dm.Root;
			}
			catch (Exception ex)
			{
				if (ex.InnerException != null)
					ex = ex.InnerException;
				var js = new JsString(ex.Message);
				throw new JavaScriptException(js);
			}
		}

#pragma warning disable IDE1006 // Naming Styles
		public ExpandoObject executeSql(ExpandoObject prms)
#pragma warning restore IDE1006 // Naming Styles
		{
			try
			{
				String source = prms.Get<String>("source");
				String command = prms.Get<String>("procedure");
				ExpandoObject dmParams = prms.Get<ExpandoObject>("parameters");
				return _dbContext.ExecuteAndLoadExpando(source, command, dmParams);
			}
			catch (Exception ex)
			{
				if (ex.InnerException != null)
					ex = ex.InnerException;
				var js = new JsString(ex.Message);
				throw new JavaScriptException(js);
			}
		}

#pragma warning disable IDE1006 // Naming Styles
		public FetchResponse fetch(String url)
#pragma warning restore IDE1006 // Naming Styles
		{
			return fetch(url, null);
		}

#pragma warning disable IDE1006 // Naming Styles
		public FetchResponse fetch(String url, ExpandoObject prms)
#pragma warning restore IDE1006 // Naming Styles
		{
			try
			{
				return new FetchCommand().Execute(url, prms);
			}
			catch (Exception ex)
			{
				if (ex.InnerException != null)
					ex = ex.InnerException;
				var js = new JsString(ex.Message);
				throw new JavaScriptException(js);
			}
		}
	}
}

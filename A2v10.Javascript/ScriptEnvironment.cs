// Copyright © 2019-2020 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using Jint;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using Jint.Runtime;
using Jint.Native;

namespace A2v10.Javascript
{
	public class ScriptEnvironment
	{
		private readonly IDbContext _dbContext;
		private readonly Engine _engine;
		private readonly IHttpService _httpService;

		public ScriptEnvironment(Engine engine, IDbContext dbContext, IHttpService httpService)
		{
			_engine = engine;
			_dbContext = dbContext;
			_httpService = httpService;
		}

#pragma warning disable IDE1006 // Naming Styles
		public ExpandoObject config
		{
			get
			{
				return null;
			}
		}

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
				var js = new JsString(ex.Message);
				throw new JavaScriptException(js);
			}
		}

		public ExpandoObject fetch(ExpandoObject prms)
		{
			try
			{
				return new FetchCommand(_httpService).Execute(prms).Result;
			}
			catch (Exception ex)
			{
				if (ex.InnerException != null)
					ex = ex.InnerException;
				var js = new JsString(ex.Message);
				throw new JavaScriptException(js);
			}
		}
#pragma warning restore IDE1006 // Naming Styles
	}
}

// Copyright © 2020 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Net.Http;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using Newtonsoft.Json;

namespace A2v10.Request
{
	public class ExecuteCallApiCommand : IServerCommand
	{
		private readonly IApplicationHost _host;
		private readonly IDbContext _dbContext;
		private readonly IHttpService _httpService;

		IDataModel _dataModel;

		public ExecuteCallApiCommand(IApplicationHost host, IDbContext dbContext, IHttpService httpService)
		{
			_host = host ?? throw new ArgumentNullException(nameof(host));
			_dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
			_httpService = httpService ?? throw new ArgumentNullException(nameof(httpService));
			_dataModel = null;
		}

		public async Task<ServerCommandResult> Execute(RequestCommand cmd, ExpandoObject dataToExec)
		{
			if (!String.IsNullOrEmpty(cmd.model))
			{
				var dmParams = dataToExec.Clone( new String[] { "url", "method", "headers", "body" });
				_dataModel = await _dbContext.LoadModelAsync(cmd.CurrentSource, cmd.LoadProcedure, dmParams);
			}

			String url = Resolve(dataToExec.Get<String>("url"), dataToExec)?.ToString();
			String method = dataToExec.Get<String>("method")?.ToString()?.ToLowerInvariant();
			var headers = dataToExec.Get<ExpandoObject>("headers");
			var body = dataToExec.Get<Object>("body");
			String bodyStr = null;

			HttpMethod mtd = HttpMethod.Get;
			if (method == "post")
			{
				mtd = HttpMethod.Post;
				bodyStr = Resolve(body, dataToExec);
			}

			using (var msg = new HttpRequestMessage(mtd, url))
			{
				SetHeaders(msg, headers, dataToExec);
				if (bodyStr != null && mtd == HttpMethod.Post)
					msg.Content = new StringContent(bodyStr, Encoding.UTF8, "application/json");
				using (var result = await _httpService.HttpClient.SendAsync(msg))
				{
					if (result.IsSuccessStatusCode)
					{
						return new ServerCommandResult(await result.Content.ReadAsStringAsync())
						{
							ConentType = result.Content.Headers.ContentType.MediaType
						};
					}
					else
					{
						throw new RequestModelException($"CallApi Failed. statusCode:{result.StatusCode}, content:{await result.Content.ReadAsStringAsync()}");
					}
				}
			}
		}


		String Resolve(Object source, ExpandoObject data)
		{
			if (source == null)
				return null;
			if (source is String strSource)
				return ResolveString(strSource, data);
			else if (source is ExpandoObject eoSource)
				return ResolveObject(eoSource, data);
			else
				throw new InvalidOperationException($"Invalid object type for CallApi ({source.GetType().Name})");
		}

		String ResolveString(String source, ExpandoObject data)
		{
			var r = ResolveEnvironment(source);
			r = ResolveParameters(r, data);
			return ResolveDataModel(r);
		}

		String ResolveObject(ExpandoObject src, ExpandoObject data)
		{
			if (src == null)
				return null;
			var resolvedObj = ResolveObjectImpl(src, data);
			if (resolvedObj == null)
				return null;
			return JsonConvert.SerializeObject(resolvedObj);
		}

		ExpandoObject ResolveObjectImpl(ExpandoObject obj, ExpandoObject data)
		{
			var retVal = new ExpandoObject();
			foreach (var d in obj as IDictionary<String, Object>)
			{
				if (d.Value is String strVal)
					retVal.Set(d.Key, Resolve(strVal, data));
				else if (d.Value is ExpandoObject eoVal)
					retVal.Set(d.Key, ResolveObjectImpl(eoVal, data));
				else
					retVal.Set(d.Key, d.Value);
			}
			return retVal;
		}


		static Regex _envRegEx;
		static Regex _prmRegEx;
		static Regex _datRegEx;

		String ResolveEnvironment(String source)
		{
			if (source.IndexOf("((") == -1)
				return source;
			if (_envRegEx == null)
				_envRegEx = new Regex("\\(\\((.+?)\\)\\)", RegexOptions.Compiled);
			var ms = _envRegEx.Matches(source);

			if (ms.Count == 0)
				return source;
			var sb = new StringBuilder(source);

			foreach (Match m in ms)
			{
				String key = m.Groups[1].Value;
				sb.Replace(m.Value, GetEnvironmentValue(key));
			}
			return sb.ToString();
		}

		String ResolveParameters(String source, ExpandoObject data)
		{
			if (source.IndexOf("[[") == -1)
				return source;
			if (_prmRegEx == null)
				_prmRegEx = new Regex("\\[\\[(.+?)\\]\\]", RegexOptions.Compiled);
			var ms = _prmRegEx.Matches(source);
			if (ms.Count == 0)
				return source;
			var sb = new StringBuilder(source);
			foreach (Match m in ms)
			{
				String key = m.Groups[1].Value;
				var valObj = data.Eval<Object>(key, null, throwIfError:true);
				if (ms.Count == 1 && m.Groups[0].Value == source)
					return valObj?.ToString(); // single element
				if (valObj is String valStr)
					sb.Replace(m.Value, valStr);
				else if (valObj is ExpandoObject valEo)
					sb.Replace(m.Value, JsonConvert.SerializeObject(valEo));
				else
					sb.Replace(m.Value, valObj.ToString());

			}
			return sb.ToString();
		}

		String ResolveDataModel(String source)
		{
			if (_dataModel == null)
				return source;
			if (source.IndexOf("{{") == -1)
				return source;
			if (_datRegEx == null)
				_datRegEx = new Regex("\\{\\{(.+?)\\}\\}", RegexOptions.Compiled);
			var ms = _datRegEx.Matches(source);
			if (ms.Count == 0)
				return source;
			var sb = new StringBuilder(source);
			foreach (Match m in ms)
			{
				String key = m.Groups[1].Value;
				var valObj = _dataModel.Eval<Object>(key);
				if (ms.Count == 1 && m.Groups[0].Value == source)
					return valObj?.ToString(); // single element
				if (valObj is String valStr)
					sb.Replace(m.Value, valStr);
				else if (valObj is ExpandoObject valEo)
					sb.Replace(m.Value, JsonConvert.SerializeObject(valEo));
				else
					sb.Replace(m.Value, valObj.ToString());

			}
			return sb.ToString();
		}

		void SetHeaders(HttpRequestMessage msg, ExpandoObject headers, ExpandoObject data)
		{
			if (headers == null)
				return;
			var d = headers as IDictionary<String, Object>;
			foreach (var hp in d)
				msg.Headers.Add(hp.Key, Resolve(hp.Value.ToString(), data)?.ToString());
		}


		String GetEnvironmentValue(String key)
		{
			String[] keys = key.Split('.');
			// first elem is appSettings key
			if (keys.Length < 2)
				throw new ArgumentOutOfRangeException($"Invalid environment key 'key'");
			var env = _host.GetEnvironmentObject(keys[0]);
			// wrap it to simplify expression evaluation
			var envObj = new ExpandoObject();
			envObj.Set(keys[0], env);
			return envObj.Eval<String>(key, fallback:null, throwIfError: true);
		}
	}
}

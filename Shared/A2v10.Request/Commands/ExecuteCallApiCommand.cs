// Copyright © 2020 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Net.Http;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using A2v10.Infrastructure;

namespace A2v10.Request
{
	public class ExecuteCallApiCommand : IServerCommand
	{
		// TODO: make service!!!!
		private static HttpClient _httpClient = new HttpClient();

		private readonly IApplicationHost _host;

		public ExecuteCallApiCommand(IApplicationHost host)
		{
			_host = host ?? throw new ArgumentNullException(nameof(host));
		}

		public async Task<ServerCommandResult> Execute(RequestCommand cmd, ExpandoObject dataToExec)
		{
			String url = Resolve(dataToExec.Get<String>("url"), dataToExec);
			String method = dataToExec.Get<String>("method")?.ToLowerInvariant();
			var headers = dataToExec.Get<ExpandoObject>("headers");

			HttpMethod mtd = HttpMethod.Get;
			if (method == "post")
				mtd = HttpMethod.Post;

			using (var msg = new HttpRequestMessage(mtd, url))
			{
				SetHeaders(msg, headers, dataToExec);
				var result = await _httpClient.SendAsync(msg);
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


		String Resolve(String source, ExpandoObject data)
		{
			if (source == null)
				return null;
			source = ResolveEnvironment(source);
			return ResolveParameters(source, data);
		}

		static Regex _envRegEx;
		static Regex _prmRegEx;

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
				sb.Replace(m.Value, data.Eval<String>(key, null, throwIfError:true));
			}
			return sb.ToString();
		}

		void SetHeaders(HttpRequestMessage msg, ExpandoObject headers, ExpandoObject data)
		{
			if (headers == null)
				return;
			var d = headers as IDictionary<String, Object>;
			foreach (var hp in d)
				msg.Headers.Add(hp.Key, Resolve(hp.Value.ToString(), data));
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

// Copyright © 2019-2022 Oleksandr Kukhtin. All rights reserved.

using System;
using System.Linq;
using System.Collections.Generic;
using System.Dynamic;
using System.IO;
using System.Net;
using System.Text;

using Newtonsoft.Json;

using A2v10.Infrastructure;

namespace A2v10.Javascript;

public class FetchCommand
{
	void SetHeaders(HttpWebRequest wr, ExpandoObject headers)
	{
		if (headers == null)
			return;
		var d = headers as IDictionary<String, Object>;
		foreach (var hp in d)
		{
			if (hp.Key == "Content-Type")
				wr.ContentType = hp.Value.ToString();
			else
				wr.Headers.Add(hp.Key, hp.Value.ToString());
		}
	}

	void AddAuthorization(HttpWebRequest wr, ExpandoObject auth)
	{
		if (auth == null)
			return;
		var type = auth.Get<String>("type");
		switch (type)
		{
			case "apiKey":
				var apiKey = auth.Get<String>("apiKey");
				wr.Headers.Add("Authorization", $"ApiKey {apiKey}");
				break;
			case "basic":
				var name = auth.Get<String>("name");
				var password = auth.Get<String>("password");
				String encoded = System.Convert.ToBase64String(System.Text.Encoding.GetEncoding("UTF-8").GetBytes(name + ":" + password));
				wr.Headers.Add("Authorization", $"Basic {encoded}");
				break;
			case "bearer":
				var token = auth.Get<String>("token");
				wr.Headers.Add("Authorization", $"Bearer {token}");
				break;
			default:
				throw new InvalidOperationException($"Invalid Authorization type ({type})");
		}
	}

	String CreateQueryString(ExpandoObject query)
	{
		if (query == null || query.IsEmpty())
			return String.Empty;
		var elems = (query as IDictionary<String, Object>)
			.Select(x => $"{x.Key}={Uri.EscapeUriString(x.Value.ToString())}");
		var ts = String.Join("&", elems);
		if (String.IsNullOrEmpty(ts))
			return String.Empty;
		return "?" + ts;
	}

	ExpandoObject GetResponseHeaders(WebHeaderCollection headers)
	{
		if (headers == null)
			return null;
		var eo = new ExpandoObject();
		foreach (var key in headers.AllKeys)
		{
			eo.Set(key, headers[key]);
		}
		return eo;
	}

	public FetchResponse Execute(String url, ExpandoObject prms)
	{
		try
		{
			var httpWebRequest = WebRequest.CreateHttp(url + CreateQueryString(prms?.Get<ExpandoObject>("query")));

			String mtd = prms?.Get<String>("method")?.ToUpperInvariant() ?? "GET";
			AddAuthorization(httpWebRequest, prms?.Get<ExpandoObject>("authorization"));
			SetHeaders(httpWebRequest, prms?.Get<ExpandoObject>("headers"));

			if (mtd == "POST" || mtd == "PUT") {
				httpWebRequest.Method = mtd;
				var bodyObj = prms?.Get<Object>("body");
				String bodyStr = null;

				switch (bodyObj)
				{
					case String strObj:
						bodyStr = strObj;
						break;
					case ExpandoObject eoObj:
						bodyStr = JsonConvert.SerializeObject(eoObj, new JsonDoubleConverter());
						httpWebRequest.ContentType = "application/json";
						break;
				}

				if (bodyStr != null)
				{
					var bytes = Encoding.GetEncoding("UTF-8").GetBytes(bodyStr);
					using var rqs = httpWebRequest.GetRequestStream();
					rqs.Write(bytes, 0, bytes.Length);
				}
			}

			using var resp = httpWebRequest.GetResponse() as HttpWebResponse;
			var contentType = resp.ContentType;
			var headers = resp.Headers;
			using var rs = resp.GetResponseStream();
			using var ms = new StreamReader(rs);
			String strResult = ms.ReadToEnd();
			return new FetchResponse(
				resp.StatusCode,
				contentType,
				strResult,
				GetResponseHeaders(headers),
				resp.StatusDescription);
		}
		catch (WebException wex)
		{
			if (wex.Response != null && wex.Response is HttpWebResponse webResp)
			{
				using var rs = new StreamReader(wex.Response.GetResponseStream());
				String strError = rs.ReadToEnd();
				var headers = wex.Response.Headers;
				// set headers
				return new FetchResponse(
					webResp.StatusCode,
					wex.Response.ContentType,
					strError,
					GetResponseHeaders(headers),
					webResp.StatusDescription);
			}
			else
				throw;
		}
	}
}
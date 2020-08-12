// Copyright © 2019-2020 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Dynamic;
using System.IO;
using System.Net;
using System.Text;

using A2v10.Infrastructure;
using Newtonsoft.Json;

namespace A2v10.Javascript
{
	public class FetchCommand
	{

		void SetHeaders(HttpWebRequest wr, ExpandoObject headers)
		{
			if (headers == null)
				return;
			var d = headers as IDictionary<String, Object>;
			foreach (var hp in d)
				wr.Headers.Add(hp.Key, hp.Value.ToString());
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
				var httpWebRequest = WebRequest.CreateHttp(url);

				String mtd = prms?.Get<String>("method")?.ToUpperInvariant() ?? "GET";
				SetHeaders(httpWebRequest, prms?.Get<ExpandoObject>("headers"));

				if (mtd == "POST") {
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
						using (var rqs = httpWebRequest.GetRequestStream())
						{
							rqs.Write(bytes, 0, bytes.Length);
						}
					}
				}

				using (var resp = httpWebRequest.GetResponse() as HttpWebResponse)
				{
					var contentType = resp.ContentType;
					var headers = resp.Headers;
					using (var rs = resp.GetResponseStream())
					{
						using (var ms = new StreamReader(rs))
						{
							String strResult = ms.ReadToEnd();
							return new FetchResponse(
								resp.StatusCode,
								contentType,
								strResult,
								GetResponseHeaders(headers),
								resp.StatusDescription);
						}
					}
				}
			}
			catch (WebException wex)
			{
				if (wex.Response != null && wex.Response is HttpWebResponse webResp)
				{
					using (var rs = new StreamReader(wex.Response.GetResponseStream()))
					{
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
				}
				else
					throw;
			}
		}
	}
}
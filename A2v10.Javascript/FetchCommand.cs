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

		public ExpandoObject Execute(String url, ExpandoObject prms)
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
							bodyStr = JsonConvert.SerializeObject(eoObj);
							httpWebRequest.ContentType = "application/json;charset=utf8";
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

				using (var resp = httpWebRequest.GetResponse())
				{
					var contentType = resp.ContentType;
					var headers = resp.Headers;
					using (var rs = resp.GetResponseStream())
					{
						using (var ms = new StreamReader(rs))
						{
							String strResult = ms.ReadToEnd();
							return JsonConvert.DeserializeObject<ExpandoObject>(strResult);
						}
					}
				}
			}
			catch (WebException wex)
			{
				if (wex.Response != null)
				{
					using (var rs = new StreamReader(wex.Response.GetResponseStream()))
					{
						String strError = rs.ReadToEnd();
					}
				}
			}
			return null;

			/*
			HttpMethod mtd = new HttpMethod(prms?.Get<String>("method")?.ToLowerInvariant() ?? "GET");
			using (var request = new HttpRequestMessage(mtd, url))
			{
				String bodyStr = null;
				var body = prms?.Get<Object>("body");
				switch (body)
				{
					case String strBody:
						bodyStr = strBody;
						break;
					case ExpandoObject eoBody:
						bodyStr = JsonConvert.SerializeObject(eoBody);
						break;
					default:
						bodyStr = body?.ToString();
						break;
				}

				if (bodyStr != null) { 
					request.Content = new StringContent(bodyStr, Encoding.UTF8, "application/json");
				}

				SetHeaders(request, prms?.Get<ExpandoObject>("headers"));

				using (var response = await client.SendAsync(request))
				{
					if (response.IsSuccessStatusCode)
					{
						var mediaType = response.Content.Headers.ContentType.MediaType;
						switch (mediaType)
						{
							case "application/json":
								var result = await response.Content.ReadAsStringAsync();
								return JsonConvert.DeserializeObject<ExpandoObject>(result);
							default:
								throw new HttpRequestException($"fetch failed. statusCode:{response.StatusCode}, content:invalid response media : '{mediaType}'");
						}
					}
					else
					{
						throw new HttpRequestException($"fetch failed. statusCode:{response.StatusCode}, content:{response.Content.ReadAsStringAsync().Result}");
					}
				}
			}
				*/
		}
	}
}
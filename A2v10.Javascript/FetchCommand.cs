// Copyright © 2019-2020 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

using A2v10.Infrastructure;
using Newtonsoft.Json;

namespace A2v10.Javascript
{
	public class FetchCommand
	{
		private readonly IHttpService _httpService;

		public FetchCommand(IHttpService httpService)
		{
			_httpService = httpService;
		}


		void SetHeaders(HttpRequestMessage msg, ExpandoObject headers)
		{
			if (headers == null)
				return;
			var d = headers as IDictionary<String, Object>;
			foreach (var hp in d)
				msg.Headers.Add(hp.Key, hp.Value.ToString());
		}

		public async Task<ExpandoObject> Execute(ExpandoObject prms)
		{
			var client = _httpService.HttpClient;
			HttpMethod mtd = new HttpMethod(prms.Get<String>("method")?.ToLowerInvariant());
			String url = prms.Get<String>("url");
			using (var request = new HttpRequestMessage(mtd, url))
			{
				String bodyStr = "";
				var body = prms.Get<Object>("body");
				switch (body) {
					case String strBody:
						bodyStr = strBody;
						break;
					case ExpandoObject eoBody:
						bodyStr = JsonConvert.SerializeObject(eoBody);
						break;
					default:
						bodyStr = body.ToString();
						break;
				}
				request.Content = new StringContent(bodyStr, Encoding.UTF8, "application/json");

				SetHeaders(request, prms.Get<ExpandoObject>("headers"));

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
		}
	}
}
// Copyright © 2020 Alex Kukhtin. All rights reserved.

using System;
using System.Net.Http;
using A2v10.Infrastructure;

namespace A2v10.Web.Base
{
	public class HttpService : IHttpService
	{
		private static readonly Lazy<HttpClient> _httpClient = new Lazy<HttpClient>(()=> new HttpClient(), true);

		public HttpClient HttpClient
		{
			get
			{
				return _httpClient.Value;
			}
		}
	}
}

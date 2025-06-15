// Copyright © 2020-2025 Oleksandr Kukhtin. All rights reserved.

using System;
using System.Net.Http;
using A2v10.Infrastructure;

namespace A2v10.Web.Base;

	public class HttpService : IHttpService
	{
		private static readonly Lazy<HttpClient> _httpClient = 
        new(()=> new HttpClient());

    private static readonly Lazy<HttpClient> _httpClientCookieless = 
        new(() => new HttpClient(new HttpClientHandler() { UseCookies = false }), true);

    public HttpClient HttpClient => _httpClient.Value;
    public HttpClient HttpClientCookieless => _httpClientCookieless.Value;
}

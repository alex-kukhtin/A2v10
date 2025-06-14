// Copyright © 2015-2025 Oleksandr Kukhtin. All rights reserved.

using System;
using System.Net.Http;
using A2v10.Infrastructure;

namespace A2v10.Web.Mvc;

public class LocalHttpService : IHttpService
{
	private static readonly Lazy<HttpClient> _httpClient = new(() => new HttpClient(), true);

    private static readonly Lazy<HttpClient> _httpClientCookieless =
        new(() => new HttpClient(new HttpClientHandler() { UseCookies = false }), true);

    public HttpClient HttpClient => _httpClient.Value;

    public HttpClient HttpClientCookieless => _httpClientCookieless.Value;
}

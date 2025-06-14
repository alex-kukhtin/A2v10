// Copyright © 2020-2025 Oleksandr Kukhtin. All rights reserved.

using System.Net.Http;

namespace A2v10.Infrastructure;

public interface IHttpService
{
	HttpClient HttpClient { get; }
    HttpClient HttpClientCookieless { get; }
}

// Copyright © 2020 Alex Kukhtin. All rights reserved.

using System.Net.Http;

namespace A2v10.Infrastructure
{
	public interface IHttpService
	{
		HttpClient HttpClient { get; }
	}
}

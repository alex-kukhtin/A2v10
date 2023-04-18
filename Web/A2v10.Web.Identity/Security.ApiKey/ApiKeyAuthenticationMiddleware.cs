// Copyright © 2021-2023 Oleksandr Kukhtin. All rights reserved.

using Owin;

using Microsoft.Owin;
using Microsoft.Owin.Security.Infrastructure;

namespace A2v10.Web.Identity.ApiKey;

class ApiKeyAuthenticationMiddleware : AuthenticationMiddleware<ApiKeyAuthenticationOptions>
{
	public ApiKeyAuthenticationMiddleware(OwinMiddleware next, IAppBuilder _/*app*/, ApiKeyAuthenticationOptions options)
		: base(next, options)
	{
	}

	protected override AuthenticationHandler<ApiKeyAuthenticationOptions> CreateHandler()
	{
		return new ApiKeyAuthenticationHandler();
	}
}

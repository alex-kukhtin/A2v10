// Copyright © 2021 Alex Kukhtin. All rights reserved.

using Owin;

using Microsoft.Owin;
using Microsoft.Owin.Security.Infrastructure;

namespace A2v10.Web.Identity.ApiKey
{
	class ApiKeyAuthenticationMiddleware : AuthenticationMiddleware<ApiKeyAuthenticationOptions>
	{
		public ApiKeyAuthenticationMiddleware(OwinMiddleware next, IAppBuilder app, ApiKeyAuthenticationOptions options)
			: base(next, options)
		{
		}

		protected override AuthenticationHandler<ApiKeyAuthenticationOptions> CreateHandler()
		{
			return new ApiKeyAuthenticationHandler();
		}
	}
}

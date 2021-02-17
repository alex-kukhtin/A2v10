using System;
using Microsoft.Owin;
using Microsoft.Owin.Security.Infrastructure;
using Owin;

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

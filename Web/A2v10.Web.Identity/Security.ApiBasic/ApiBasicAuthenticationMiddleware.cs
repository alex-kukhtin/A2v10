// Copyright © 2021 Alex Kukhtin. All rights reserved.

using Owin;

using Microsoft.Owin;
using Microsoft.Owin.Security.Infrastructure;

namespace A2v10.Web.Identity.ApiBasic
{
	class ApiBasicAuthenticationMiddleware : AuthenticationMiddleware<ApiBasicAuthenticationOptions>
	{
		public ApiBasicAuthenticationMiddleware(OwinMiddleware next, IAppBuilder app, ApiBasicAuthenticationOptions options)
			: base(next, options)
		{
		}

		protected override AuthenticationHandler<ApiBasicAuthenticationOptions> CreateHandler()
		{
			return new ApiBasicAuthenticationHandler();
		}
	}
}

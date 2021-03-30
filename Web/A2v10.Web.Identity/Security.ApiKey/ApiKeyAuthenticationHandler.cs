// Copyright © 2021 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.Infrastructure;

namespace A2v10.Web.Identity.ApiKey
{
	internal class ApiKeyAuthenticationHandler : AuthenticationHandler<ApiKeyAuthenticationOptions>
	{
		AuthenticationTicket Fail()
		{
			Response.StatusCode = Options.UnauthorizedCode;
			return null;
		}

		protected override async Task<AuthenticationTicket> AuthenticateCoreAsync()
		{
			const String API_KEY = "ApiKey";

			String apiKey = null;
			String header = Request.Headers.Get("Authorization");
			if (!String.IsNullOrEmpty(header)) {
				if (header.StartsWith(API_KEY, StringComparison.OrdinalIgnoreCase))
					apiKey = header.Substring(API_KEY.Length).Trim();
			}
			else
			{
				header = Request.Headers.Get("X-API-Key");
				if (!String.IsNullOrEmpty(header))
					apiKey = header;
			}

			if (apiKey == null)
				return null;

			var context = new ApiKeyValidateIdentityContext(Context, Options, apiKey, Request.RemoteIpAddress);

			await Options.Provider.ValidateIdentity(context);

			if (context.IsValidated)
			{
				var claims = new List<Claim>
				{
					new Claim(ClaimTypes.AuthenticationMethod, context.Options.AuthenticationType)
				};

				foreach (var cl in context.Claims)
					claims.Add(cl);

				var identity = new ClaimsIdentity(context.Claims, this.Options.AuthenticationType);

				return new AuthenticationTicket(identity, new AuthenticationProperties()
				{
					IssuedUtc = DateTime.UtcNow
				});
			}
			return Fail();
		}
	}
}

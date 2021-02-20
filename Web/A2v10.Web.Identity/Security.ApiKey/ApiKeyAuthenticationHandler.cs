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
		protected override async Task<AuthenticationTicket> AuthenticateCoreAsync()
		{
			String header = Request.Headers.Get(Options.Header);
			if (String.IsNullOrEmpty(header))
				return null;

			if (!header.StartsWith(Options.Key, StringComparison.InvariantCultureIgnoreCase))
				return null;

			String apiKey = header.Substring(Options.Key.Length).Trim();

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
			return null;
		}
	}
}

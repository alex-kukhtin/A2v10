// Copyright © 2021 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.Infrastructure;

namespace A2v10.Web.Identity.ApiBasic
{
	internal class ApiBasicAuthenticationHandler : AuthenticationHandler<ApiBasicAuthenticationOptions>
	{
		AuthenticationTicket Fail()
		{
			Response.StatusCode = Options.UnauthorizedCode;
			return null;
		}

		protected override async Task<AuthenticationTicket> AuthenticateCoreAsync()
		{
			const String API_BASIC = "Basic";

			String apiUserPassword = null;
			String header = Request.Headers.Get("Authorization");

			if (!String.IsNullOrEmpty(header)) {
				if (header.StartsWith(API_BASIC, StringComparison.OrdinalIgnoreCase))
					apiUserPassword = header.Substring(API_BASIC.Length).Trim();
			}
			if (apiUserPassword == null)
				return null;

			var converted = Encoding.UTF8.GetString(Convert.FromBase64String(apiUserPassword)).Split(':');
			if (converted.Length != 2) {
				return Fail();
			}
			String user = converted[0];
			String password = converted[1];

			var context = new ApiBasicValidateIdentityContext(Context, Options, user, password, Request.RemoteIpAddress);

			await Options.Provider.ValidateIdentity(context);



			if (context.IsValidated)
			{
				Response.Headers.Append("WWW-Authenticate", API_BASIC);
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

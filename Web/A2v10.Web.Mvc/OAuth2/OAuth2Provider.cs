// Copyright © 2020-2021 Alex Kukhtin. All rights reserved.

using System;
using System.IO;
using System.Text;
using System.Collections.Specialized;
using System.Configuration;
using System.Threading.Tasks;
using System.Web;
using System.Collections.Generic;
using System.Dynamic;
using System.Security.Claims;

using Newtonsoft.Json;

using Microsoft.Owin;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.OAuth;

using A2v10.Infrastructure;
using A2v10.Data.Interfaces;

namespace A2v10.Web.Mvc.OAuth2
{
	public class OAuth2Provider : OAuthAuthorizationServerProvider
	{
		private readonly IApplicationHost _host;
		private readonly IDbContext _dbContext;
		private readonly Oauth2Section _config;

		public OAuth2Provider()
		{
			_host = ServiceLocator.Current.GetService<IApplicationHost>();
			_dbContext = ServiceLocator.Current.GetService<IDbContext>();
			_config = ConfigurationManager.GetSection("oauth2") as Oauth2Section;
		}

		NameValueCollection ParseBody(IOwinRequest request)
		{
			var stream = request.Body;
			using (var ms = new MemoryStream())
			{
				stream.Seek(0, SeekOrigin.Begin);
				stream.CopyTo(ms);
				var strBody = Encoding.UTF8.GetString(ms.ToArray());

				switch (request.ContentType?.ToLowerInvariant())
				{
					case "application/x-www-form-urlencoded":
						return HttpUtility.ParseQueryString(strBody);
					case "application/json":
						return JsonConvert.DeserializeObject<NameValueCollection>(strBody);
				}
				return null;
			}
		}

		public override Task MatchEndpoint(OAuthMatchEndpointContext context)
		{
			return base.MatchEndpoint(context);
		}

		public override Task TokenEndpoint(OAuthTokenEndpointContext context)
		{
			return base.TokenEndpoint(context);
		}

		public override Task GrantRefreshToken(OAuthGrantRefreshTokenContext context)
		{
			return base.GrantRefreshToken(context);
		}

		public override Task GrantResourceOwnerCredentials(OAuthGrantResourceOwnerCredentialsContext context)
		{
			return base.GrantResourceOwnerCredentials(context);
		}

		public override async Task ValidateClientAuthentication(OAuthValidateClientAuthenticationContext context)
		{
			/* POST only. TODO: uncomment this
			if (context.Request.Method?.ToUpperInvariant() != "POST")
			{
				context.Rejected();
				context.SetError("Invalid http method", "Only the POST method is allowed");
				return;
			}
			*/

			if (!context.TryGetFormCredentials(out String clientId, out String clientSecret))
			{
				context.SetError("parameter_absent");
				context.Rejected();
				return;
			}

			var prms = new ExpandoObject();
			prms.Set("ClientId", clientId);
			prms.Set("ClientSecret", clientSecret);

			ApiV2User user = await _dbContext.LoadAsync<ApiV2User>(_host.CatalogDataSource, "a2security.[ApiUser.Load]", prms);

			if (user == null)
			{
				context.Rejected();
				return;
			}

			// TODO: allow ORIGIN, allowIp
			context.Response.Headers.Add("Access-Control-Allow-Origin", new String[] { "*" });
			context.Request.Set<ApiV2User>("ApiUser", user);
			context.Validated(clientId);
		}

		public override Task GrantAuthorizationCode(OAuthGrantAuthorizationCodeContext context)
		{
			return base.GrantAuthorizationCode(context);
		}

		public override Task GrantClientCredentials(OAuthGrantClientCredentialsContext context)
		{
			var user = context.Request.Get<ApiV2User>("ApiUser");

			if (user == null)
			{
				context.Rejected();
				context.SetError("unauthorized_client");
				return Task.CompletedTask;
			}

			var body = ParseBody(context.Request);

			var claims = new List<Claim>
			{
				new Claim("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier", user.Id.ToString()),
				new Claim(ClaimsIdentity.DefaultNameClaimType, user.Name),
				new Claim("client_id", body["client_id"])
			};

			void AddClaimFromBody(String name)
			{
				var val = body[name];
				if (val != null)
					claims.Add(new Claim(name, val));
			}

			if (user.Segment != null)
				claims.Add(new Claim("Segment", user.Segment));
			if (user.TenantId != 0)
				claims.Add(new Claim("TenantId", user.TenantId.ToString()));

			AddClaimFromBody("session_id");
			AddClaimFromBody("state");

			var oaClaim = new ClaimsIdentity(claims, OAuthDefaults.AuthenticationType);
			var ticket = new AuthenticationTicket(oaClaim, new AuthenticationProperties());

			context.Validated(ticket);

			return Task.CompletedTask;
		}
	}
}

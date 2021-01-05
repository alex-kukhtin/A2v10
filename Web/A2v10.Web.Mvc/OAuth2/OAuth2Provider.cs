// Copyright © 2020 Alex Kukhtin. All rights reserved.

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
using Newtonsoft.Json.Converters;

using Microsoft.Owin.Security.OAuth;
using Microsoft.Owin.Security;

using A2v10.Infrastructure;
using Microsoft.Owin;
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

		ClientElement GetClientInfo(NameValueCollection body, BaseValidatingContext<OAuthAuthorizationServerOptions> context)
		{
			if (body == null)
				return null;

			var oauth2Config = ConfigurationManager.GetSection("oauth2") as Oauth2Section;

			var clientId = body["client_id"];
			if (clientId == null)
			{
				context.SetError("'client_id' not found");
				context.Rejected();
				return null;
			}
			var client = oauth2Config.clients.GetSource(clientId);
			if (client == null)
			{
				context.SetError("'client_id' not found");
				context.Rejected();
				return null;
			}
			if (!String.IsNullOrEmpty(client.allowIp) && client.allowIp != "*")
			{
				// TODO: check Ip
			}
			if (!String.IsNullOrEmpty(client.allowOrigin) && client.allowOrigin != "*")
			{
				// TODO: checkOrigin
			}

			return client;
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

		public override Task ValidateClientAuthentication(OAuthValidateClientAuthenticationContext context)
		{
			/* POST only. TODO: uncomment this
			if (context.Request.Method?.ToUpperInvariant() != "POST")
			{
				context.Rejected();
				context.SetError("Invalid http method", "Only the POST method is allowed");
				return Task.CompletedTask;
			}
			*/

			NameValueCollection body = ParseBody(context.Request);

			var info = GetClientInfo(body, context);
			if (info != null)
			{
				context.Validated();
				context.Response.Headers.Add("Access-Control-Allow-Origin", new String[] { "*" });
			}
			else
			{
				context.Rejected();
			}
			context.TryGetFormCredentials(out String clientId, out String clientSecret);
			//var oaClaim = new ClaimsIdentity(claims, OAuthDefaults.AuthenticationType);
			//var ticket = new AuthenticationTicket(oaClaim, new AuthenticationProperties());
			context.Validated("clientId");
			return Task.CompletedTask;
		}

		public override Task GrantAuthorizationCode(OAuthGrantAuthorizationCodeContext context)
		{
			ExpandoObject dataEO = new ExpandoObject();
			dataEO.Set("UserId", 99);
			dataEO.Set("TenantId", 123);

			var claims = new List<Claim>();
			foreach (var kv in dataEO.Enumerate())
				claims.Add(new Claim(kv.Key, kv.Value.ToString()));

			var oaClaim = new ClaimsIdentity(claims, OAuthDefaults.AuthenticationType);
			var ticket = new AuthenticationTicket(oaClaim, new AuthenticationProperties());

			context.Validated(ticket);

			return Task.CompletedTask;
		}

		public override Task GrantClientCredentials(OAuthGrantClientCredentialsContext context)
		{
			NameValueCollection body = ParseBody(context.Request);

			var client = GetClientInfo(body, context);

			if (client == null)
			{
				context.Rejected();
				return Task.CompletedTask;
			}

			ExpandoObject dataEO = new ExpandoObject();
			dataEO.Set("UserId", 99);
			dataEO.Set("TenantId", 123);
			dataEO.Set(ClaimsIdentity.DefaultNameClaimType, "admin@admin.com");
			dataEO.Set("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier", 99);
			dataEO.Set("Segment", "Segment345");

			var strData = body["data"];
			if (strData != null)
			{
				var dataJson = Encrypt.DecryptString_Aes(strData, client.key, client.vector);
				dataEO = JsonConvert.DeserializeObject<ExpandoObject>(dataJson, new ExpandoObjectConverter());
			}
			var strSecret = body["client_secret"];
			if (strSecret != null)
			{
				/*
				if (strSecret == client.secret)
				{
					dataEO = new ExpandoObject();
					dataEO.Set("client_id", body["client_id"]);
					dataEO.Set("session_id", body["session_id"]);
				}
				*/
			}

			/*
			if (dataEO == null || dataEO.Get<String>("client_id") != client.id)
			{
				context.Rejected();
				return Task.CompletedTask;
			}
			*/

			var claims = new List<Claim>();
			foreach (var kv in dataEO.Enumerate())
				claims.Add(new Claim(kv.Key, kv.Value.ToString()));

			var oaClaim = new ClaimsIdentity(claims, OAuthDefaults.AuthenticationType);
			var ticket = new AuthenticationTicket(oaClaim, new AuthenticationProperties());

			context.Validated(ticket);

			return Task.CompletedTask;
		}
	}
}

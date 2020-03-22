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

namespace A2v10.Web.Mvc.OAuth2
{
	public class OAuth2Provider : OAuthAuthorizationServerProvider
	{
		NameValueCollection ParseBody(Stream stream)
		{
			using (var ms = new MemoryStream())
			{
				stream.Seek(0, SeekOrigin.Begin);
				stream.CopyTo(ms);
				var strBody = Encoding.UTF8.GetString(ms.ToArray());
				return HttpUtility.ParseQueryString(strBody);
			}
		}

		ServerElement GetServerInfo(NameValueCollection body, BaseValidatingContext<OAuthAuthorizationServerOptions> context)
		{
			var oauth2Config = ConfigurationManager.GetSection("oauth2") as Oauth2Section;

			var clientId = body["client_id"];
			if (clientId == null)
			{
				context.SetError("'client_id' not found");
				context.Rejected();
				return null;
			}
			var server = oauth2Config.servers.GetSource(clientId);
			if (server == null)
			{
				context.SetError("'client_id' not found");
				context.Rejected();
				return null;
			}
			return server;
		}

		public override Task ValidateClientAuthentication(OAuthValidateClientAuthenticationContext context)
		{
			NameValueCollection body = ParseBody(context.Request.Body);

			var info = GetServerInfo(body, context);
			if (info != null)
				context.Validated();
			return Task.CompletedTask;
		}

		public override Task GrantClientCredentials(OAuthGrantClientCredentialsContext context)
		{
			NameValueCollection body = ParseBody(context.Request.Body);
			var server = GetServerInfo(body, context);

			if (server == null)
				return Task.CompletedTask;

			var strData = body["data"];
			if (strData == null)
			{
				context.SetError("'data' not found");
				context.Rejected();
				return Task.CompletedTask;
			}

			var dataJson = Encrypt.DecryptString_Aes(strData, server.key, server.vector);
			var dataEO = JsonConvert.DeserializeObject<ExpandoObject>(dataJson, new ExpandoObjectConverter());

			if (dataEO == null || dataEO.Get<String>("client_id") != server.clientId)
			{
				context.Rejected();
				return Task.CompletedTask;
			}

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

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

		ClientElement GetClientInfo(NameValueCollection body, BaseValidatingContext<OAuthAuthorizationServerOptions> context)
		{
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

		public override Task ValidateClientAuthentication(OAuthValidateClientAuthenticationContext context)
		{
			NameValueCollection body = ParseBody(context.Request.Body);

			var info = GetClientInfo(body, context);
			if (info != null)
			{
				context.Validated();
				context.Response.Headers.Add("Access-Control-Allow-Origin", new String[] { "*"});
			}
			return Task.CompletedTask;
		}

		public override Task GrantClientCredentials(OAuthGrantClientCredentialsContext context)
		{
			NameValueCollection body = ParseBody(context.Request.Body);
			var client = GetClientInfo(body, context);

			if (client == null)
				return Task.CompletedTask;

			ExpandoObject dataEO = null;

			var strData = body["data"];
			if (strData != null)
			{
				var dataJson = Encrypt.DecryptString_Aes(strData, client.key, client.vector);
				dataEO = JsonConvert.DeserializeObject<ExpandoObject>(dataJson, new ExpandoObjectConverter());
			}
			var strSecret = body["client_secret"];
			if (strSecret != null)
			{
				if (strSecret == client.secret)
				{
					dataEO = new ExpandoObject();
					dataEO.Set("client_id", body["client_id"]);
					dataEO.Set("session_id", body["session_id"]);
				}
			}

			if (dataEO == null || dataEO.Get<String>("client_id") != client.id)
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

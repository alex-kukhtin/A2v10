// Copyright © 2021 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Security.Claims;
using System.Threading.Tasks;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;

namespace A2v10.Web.Identity.ApiKey
{
	public static class DbValidateApiKey
	{
		public static async Task ValidateApiKey(ApiKeyValidateIdentityContext context, String schema = null)
		{
			schema = schema ?? "a2security";
			var sql = $"[{schema}].[FindApiUserByApiKey]";
			var prms = new ExpandoObject();
			prms.Set("Host", context.Host);
			prms.Set("ApiKey", context.ApiKey);

			var dbContext = ServiceLocator.Current.GetService<IDbContext>();
			var user = await dbContext.LoadAsync<ApiAppUser>(null, sql, prms);

			if (user != null)
			{
				var claims = new List<Claim>();
				claims.Add(new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()));
				claims.Add(new Claim("TenantId", user.Tenant.ToString()));
				claims.Add(new Claim("Segment", user.Segment ?? String.Empty));
				claims.Add(new Claim(ClaimTypes.Name, user.Name));
				claims.Add(new Claim("AllowIp", user.AllowIP ?? String.Empty));
				claims.Add(new Claim("ClientId", user.ClientId ?? String.Empty));

				context.Claims = claims;
				context.IsValidated = true;
			}
		}
	}
}

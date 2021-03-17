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
		private static Boolean IsValidIPAddress(String allow, String real)
		{
			if (String.IsNullOrEmpty(allow) || allow == "*")
				return true; // all
			var arr = allow.Replace(" ", ",").Split(',');
			foreach (var x in arr)
			{
				if (x == real)
					return true;
			}
			return false;
		}

		static List<Claim> CreateClaims(ApiAppUser user)
		{
			return new List<Claim>()
			{
				new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
				new Claim("TenantId", user.Tenant.ToString()),
				new Claim("Segment", user.Segment ?? String.Empty),
				new Claim(ClaimTypes.Name, user.Name),
				new Claim("AllowIp", user.AllowIP ?? String.Empty),
				new Claim("ClientId", user.ClientId ?? String.Empty)
			};
		}

		public static async Task ValidateApiKey(ApiKeyValidateIdentityContext context, String schema = null)
		{
			var dbContext = ServiceLocator.Current.GetService<IDbContext>();
			var host = ServiceLocator.Current.GetService<IApplicationHost>();

			schema = schema ?? "a2security";
			var findUsersql = $"[{schema}].[FindApiUserByApiKey]";
			var writeLogSql = $"[{schema}].[WriteLog]";

			var prms = new ExpandoObject();
			prms.Set("Host", context.Host);
			prms.Set("ApiKey", context.ApiKey);

			var user = await dbContext.LoadAsync<ApiAppUser>(host.CatalogDataSource, findUsersql, prms);

			if (user != null)
			{
				if (IsValidIPAddress(user.AllowIP, context.Host))
				{
					context.Claims = CreateClaims(user);
					context.IsValidated = true;
				}
				else
				{
					var fo = new ExpandoObject();
					fo.Set("UserId", user.Id);
					fo.Set("SeverityChar", "W");
					fo.Set("Code", 66 /*Api IP forbidden*/);
					fo.Set("Message", $"expected: '{user.AllowIP}', actual:'{context.Host}'");
					await dbContext.ExecuteExpandoAsync(host.CatalogDataSource, writeLogSql, fo);
				}
			}
		}
	}
}

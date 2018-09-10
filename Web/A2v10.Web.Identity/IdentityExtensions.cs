// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Security.Principal;
using System.Security.Claims;
using Microsoft.AspNet.Identity;

namespace A2v10.Web.Identity
{
	public static class IdentityExtensions
	{
		public static String GetUserPersonName(this IIdentity identity)
		{
			if (!(identity is ClaimsIdentity user))
				return null;
			var value = user.FindFirstValue("PersonName");
			return String.IsNullOrEmpty(value) ? identity.GetUserName() : value;
		}

		public static Boolean IsUserAdmin(this IIdentity identity)
		{
			if (!(identity is ClaimsIdentity user))
				return false;
			var value = user.FindFirstValue("Admin");
			return value == "Admin";
		}

		public static Int32 GetUserTenantId(this IIdentity identity)
		{
			if (identity == null)
				return 0;
			if (!(identity is ClaimsIdentity user))
				return 0;
			var value = user.FindFirstValue("TenantId");
			if (Int32.TryParse(value, out Int32 tenantId))
				return tenantId;
			return 0;
		}

		public static String GetUserClaim(this IIdentity identity, String claim)
		{
			if (!(identity is ClaimsIdentity user))
				return null;
			return user.FindFirstValue(claim);
		}
	}
}

// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Security.Principal;
using System.Security.Claims;
using Microsoft.AspNet.Identity;
using A2v10.Infrastructure;
using System.Threading;

namespace A2v10.Web.Identity
{
	public class IdentityUserInfo : IUserInfo
	{
		public Int64 UserId { get; set; }
		public Boolean IsAdmin { get; set; }
		public Boolean IsTenantAdmin { get; set; }
	}

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

		public static String GetUserClientId(this IIdentity identity)
		{
			if (!(identity is ClaimsIdentity user))
				return null;
			var value = user.FindFirstValue("ClientId");
			return String.IsNullOrEmpty(value) ? null : value;
		}

		public static String GetUserLocale(this IIdentity identity)
		{
			if (!(identity is ClaimsIdentity user))
				return null;
			var value = user.FindFirstValue("Locale");
			return String.IsNullOrEmpty(value) ? Thread.CurrentThread.CurrentUICulture.Name : value;
		}


		public static Boolean IsTenantAdmin(this IIdentity identity)
		{
			if (!(identity is ClaimsIdentity user))
				return false;
			var value = user.FindFirstValue("TenantAdmin");
			return value == "TenantAdmin";
		}

		public static IUserInfo UserInfo(this IIdentity identity)
		{
			if (!(identity is ClaimsIdentity user))
				return null;
			var ui = new IdentityUserInfo()
			{
				UserId = identity.GetUserId<Int64>()
			};

			var value = user.FindFirstValue("Admin");
			ui.IsAdmin = value == "Admin";

			value = user.FindFirstValue("TenantAdmin");
			ui.IsTenantAdmin = value == "TenantAdmin";
			return ui;
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

		public static String GetUserSegment(this IIdentity identity)
		{
			if (identity == null)
				return null;
			if (!(identity is ClaimsIdentity user))
				return null;
			return user.FindFirstValue("Segment");
		}

		public static String GetUserClaim(this IIdentity identity, String claim)
		{
			if (!(identity is ClaimsIdentity user))
				return null;
			return user.FindFirstValue(claim);
		}
	}
}

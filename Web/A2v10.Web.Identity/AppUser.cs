// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Threading.Tasks;
using System.Security.Claims;

using Microsoft.AspNet.Identity;

namespace A2v10.Web.Identity
{
	[Flags]
	public enum UserModifiedFlag
	{
		Default = 0,
		Lockout = 0x0001,
		Password = 0x0002,
		LastLogin = 0x0004,
		EmailConfirmed = 0x0008,
		PhoneNumber = 0x0010
	}

	public class AppUser : IUser<Int64>
	{
		#region IUser<Int64>
		public Int64 Id { get; set; }
		public String UserName { get; set; }
		#endregion

		public String PersonName { get; set; }
		public Boolean IsAdmin { get; set; }
		public Int32 Tenant { get; set; }
		public String Email { get; set; }
		public String PhoneNumber { get; set; }
		public String Memo { get; set; }

		public String PasswordHash { get; set; }
		public String SecurityStamp { get; set; }
		public DateTimeOffset LockoutEndDateUtc { get; set; }
		public Boolean LockoutEnabled { get; set; }
		public Int32 AccessFailedCount { get; set; }
		public Boolean TwoFactorEnabled { get; set; }
		public Boolean EmailConfirmed { get; set; }
		public Boolean PhoneNumberConfirmed { get; set; }
		public Boolean ChangePasswordEnabled { get; set; }
		// for multi tenant environment
		public String RegisterHost { get; set; }
		public String TariffPlan { get; set; }

		// for CreateTenantUser only
		public String TenantRoles { get; set; }

		// optional (for delete)
		public Int64 CurrentUser { get; set; }

		DateTime? _lastLoginDate;
		String _lastLoginHost;

		public DateTime? LastLoginDate
		{
			get { return _lastLoginDate; }
			set {
				if (_lastLoginDate == value)
					return;
				_lastLoginDate = value;
				SetModified(UserModifiedFlag.LastLogin);
			}
		}

		public String LastLoginHost
		{
			get { return _lastLoginHost; }
			set {
				if (_lastLoginHost == value)
					return;
				_lastLoginHost = value;
				SetModified(UserModifiedFlag.LastLogin); }
		}

		UserModifiedFlag _modifiedFlag;

		public void SetModified(UserModifiedFlag flag)
		{
			_modifiedFlag |= flag;
		}

		public void ClearModified(UserModifiedFlag flag)
		{
			_modifiedFlag &= ~flag;
		}

		public Boolean IsLockoutModified      => _modifiedFlag.HasFlag(UserModifiedFlag.Lockout);
		public Boolean IsPasswordModified     => _modifiedFlag.HasFlag(UserModifiedFlag.Password);
		public Boolean IsLastLoginModified    => _modifiedFlag.HasFlag(UserModifiedFlag.LastLogin);
		public Boolean IsEmailConfirmModified => _modifiedFlag.HasFlag(UserModifiedFlag.EmailConfirmed);
		public Boolean IsPhoneNumberModified => _modifiedFlag.HasFlag(UserModifiedFlag.PhoneNumber);

		public async Task<ClaimsIdentity> GenerateUserIdentityAsync(UserManager<AppUser, Int64> manager)
		{
			// Note the authenticationType must match the one defined in CookieAuthenticationOptions.AuthenticationType
			var userIdentity = await manager.CreateIdentityAsync(this, DefaultAuthenticationTypes.ApplicationCookie);
			// Add custom user claims here
			return userIdentity;
		}
	}
}

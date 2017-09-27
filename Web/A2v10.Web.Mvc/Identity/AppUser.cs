using System;
using System.Threading.Tasks;
using System.Security.Claims;

using Microsoft.AspNet.Identity;

namespace A2v10.Web.Mvc.Identity
{
	[Flags]
	public enum UserModifiedFlag
	{
		Default  = 0,
		Lockout  = 0x0001,
        Password = 0x0002
	}

	public class AppUser : IUser<Int64>
	{
		#region IUser<Int64>
		public Int64 Id { get; set; }
		public String UserName { get; set; }
		#endregion

        public String PersonName { get; set; }
		public String Email { get; set; }
		public String PhoneNumber { get; set; }

		public String PasswordHash { get; set; }
		public String SecurityStamp { get; set; }
		public DateTimeOffset LockoutEndDateUtc { get; set; }
		public Boolean LockoutEnabled { get; set; }
		public Int32 AccessFailedCount { get; set; }
		public Boolean TwoFactorEnabled { get; set; }
		public Boolean EmailConfirmed { get; set; }
		public Boolean PhoneNumberConfirmed { get; set; }

		UserModifiedFlag _modifiedFlag;

		public void SetModified(UserModifiedFlag flag)
		{
			_modifiedFlag |= flag; ;
		}

		public void ClearModified(UserModifiedFlag flag)
		{
			_modifiedFlag &= ~flag;
		}

		public Boolean IsLockoutModified
		{
			get
			{
				return _modifiedFlag.HasFlag(UserModifiedFlag.Lockout);
			}
		}

        public Boolean IsPasswordModified
        {
            get
            {
                return _modifiedFlag.HasFlag(UserModifiedFlag.Password);
            }
        }

        public async Task<ClaimsIdentity> GenerateUserIdentityAsync(UserManager<AppUser, Int64> manager)
		{
			// Note the authenticationType must match the one defined in CookieAuthenticationOptions.AuthenticationType
			var userIdentity = await manager.CreateIdentityAsync(this, DefaultAuthenticationTypes.ApplicationCookie);
			// Add custom user claims here
			return userIdentity;
		}
	}
}

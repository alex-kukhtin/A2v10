// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

using Microsoft.AspNet.Identity;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using System.Configuration;

namespace A2v10.Web.Identity
{
	public class AppUserStore :
		IDisposable,
		IUserStore<AppUser, Int64>,
		IUserLoginStore<AppUser, Int64>,
		IUserLockoutStore<AppUser, Int64>,
		IUserPasswordStore<AppUser, Int64>,
		IUserTwoFactorStore<AppUser, Int64>,
		IUserEmailStore<AppUser, Int64>,
		IUserPhoneNumberStore<AppUser, Int64>,
		IUserSecurityStampStore<AppUser, Int64>,
		IUserRoleStore<AppUser, Int64>,
		IUserClaimStore<AppUser, Int64>
	{

		class UserCache
		{
			Dictionary<String, AppUser> _mapNames = new Dictionary<String, AppUser>();
			Dictionary<Int64, AppUser> _mapIds = new Dictionary<Int64, AppUser>();

			public AppUser GetById(Int64 id)
			{
				if (_mapIds.TryGetValue(id, out AppUser user))
					return user;
				return null;
			}
			public AppUser GetByName(String name)
			{
				if (_mapNames.TryGetValue(name, out AppUser user))
					return user;
				return null;
			}

			public AppUser GetByEmail(String email)
			{
				foreach (var u in _mapIds)
					if (String.Compare(u.Value.Email, email, ignoreCase:true) == 0)
						return u.Value;
				return null;
			}

			public AppUser GetByPhoneNumber(String phone)
			{
				foreach (var u in _mapIds)
					if (u.Value.PhoneNumber == phone)
						return u.Value;
				return null;
			}

			public void DeleteUser(AppUser user)
			{
				if (user == null)
					return;
				_mapIds.Remove(user.Id);
				_mapNames.Remove(user.UserName);
			}

			public void CacheUser(AppUser user)
			{
				if (user == null)
					return;
				if (!_mapIds.ContainsKey(user.Id))
				{
					_mapIds.Add(user.Id, user);
				}
				else
				{
					var existing = _mapIds[user.Id];
					if (!user.Equals(existing))
						throw new InvalidProgramException("Invalid user cache");
				}
				if (!_mapNames.ContainsKey(user.UserName))
				{
					_mapNames.Add(user.UserName, user);
				}
				else
				{
					var existing = _mapIds[user.Id];
					if (!user.Equals(existing))
						throw new InvalidProgramException("Invalid user cache");
				}
			}
		}

		private readonly IDbContext _dbContext;
		private readonly IApplicationHost _host;

		private UserCache _cache;

		private String _customSchema;

		public AppUserStore(IDbContext dbContext, IApplicationHost host)
		{
			_dbContext = dbContext;
			_host = host;
			_cache = new UserCache();
		}

		public String DbSchema => _customSchema ?? "a2security";

		public void SetCustomSchema(String schema)
		{
			if (schema != null)
				_customSchema = schema;
		}

		internal String DataSource => _host.CatalogDataSource;

		#region IUserStore

		public async Task CreateAsync(AppUser user)
		{
			await _dbContext.ExecuteAsync(DataSource, $"[{DbSchema}].[CreateUser]", user);
			if (_host.IsMultiTenant)
			{
				/*
				 * Do nothing.
				 * Tenant will be created after email confirmation.
				*/
			}
			else
			{
				CacheUser(user);
			}
		}

		public async Task DeleteAsync(AppUser user)
		{
			await _dbContext.ExecuteAsync<AppUser>(DataSource, $"[{DbSchema}].[DeleteUser]", user);
			_cache.DeleteUser(user);
		}

		public async Task<AppUser> FindByIdAsync(Int64 userId)
		{
			if (userId == 0)
				return null;
			AppUser user = _cache.GetById(userId);
			if (user != null)
				return user;
			user = await _dbContext.LoadAsync<AppUser>(DataSource, $"[{DbSchema}].[FindUserById]", new { Id = userId });
			if (user == null)
				return null;
			CacheUser(user);
			return user;
		}

		public async Task<AppUser> FindByNameAsync(String userName)
		{
			AppUser user = _cache.GetByName(userName);
			if (user != null)
				return user;
			user = await _dbContext.LoadAsync<AppUser>(DataSource, $"[{DbSchema}].[FindUserByName]", new { UserName = userName });
			CacheUser(user);
			return user;
		}

		public async Task UpdateAsync(AppUser user)
		{
			if (user.IsPhoneNumberModified)
			{
				// verify Phone number
				await _dbContext.ExecuteAsync<AppUser>(DataSource, $"[{DbSchema}].[ConfirmPhoneNumber]", user);
				user.ClearModified(UserModifiedFlag.PhoneNumber | UserModifiedFlag.LastLogin | UserModifiedFlag.Password);
			}
			if (user.IsLockoutModified)
			{
				await _dbContext.ExecuteAsync<AppUser>(DataSource, $"[{DbSchema}].[UpdateUserLockout]", user);
				// do not call last login here
				user.ClearModified(UserModifiedFlag.Lockout | UserModifiedFlag.LastLogin);
			}
			if (user.IsPasswordModified)
			{
				await _dbContext.ExecuteAsync<AppUser>(DataSource, $"[{DbSchema}].[UpdateUserPassword]", user);
				user.ClearModified(UserModifiedFlag.Password);
			}
			if (user.IsLastLoginModified)
			{
				await _dbContext.ExecuteAsync<AppUser>(DataSource, $"[{DbSchema}].[UpdateUserLogin]", user);
				user.ClearModified(UserModifiedFlag.LastLogin);

			}
			if (user.IsEmailConfirmModified)
			{
				await _dbContext.ExecuteAsync<AppUser>(DataSource, $"[{DbSchema}].[ConfirmEmail]", user);
				user.ClearModified(UserModifiedFlag.EmailConfirmed);
				if (user.EmailConfirmed)
				{
					await CreateTenantUser(user);
				}
			}
		}

		#endregion

		async Task CreateTenantUser(AppUser user)
		{
			if (_host.IsMultiTenant)
			{
				// with TenantRoles
				var createdUser = await FindByIdAsync(user.Id);
				// WITHOUT CACHE!
				//var createdUser = await _dbContext.LoadAsync<AppUser>(DataSource, $"[{DbSchema}].[FindUserById]", new { Id user.Id });
				_host.TenantId = createdUser.Tenant;
				_host.UserId = createdUser.Id;
				_host.UserSegment = createdUser.Segment;
				await _dbContext.ExecuteAsync(_host.TenantDataSource, $"[{DbSchema}].[CreateTenantUser]", createdUser);
			}
		}

		void CacheUser(AppUser user)
		{
			_cache.CacheUser(user);
		}

		#region IDisposable Support
		private Boolean disposedValue = false; // To detect redundant calls

		protected virtual void Dispose(Boolean disposing)
		{
			if (!disposedValue)
			{
				_cache = null;
				disposedValue = true;
			}
		}

		// This code added to correctly implement the disposable pattern.
		public void Dispose()
		{
			Dispose(true);
		}
		#endregion

		#region IUserLoginStore
		public async Task AddLoginAsync(AppUser user, UserLoginInfo login)
		{
			await _dbContext.ExecuteAsync(DataSource, $"[{DbSchema}].[AddUserLogin]", new { UserId = user.Id, login.LoginProvider, login.ProviderKey });
		}

		public Task RemoveLoginAsync(AppUser user, UserLoginInfo login)
		{
			throw new NotImplementedException(nameof(RemoveLoginAsync));
		}

		public Task<IList<UserLoginInfo>> GetLoginsAsync(AppUser user)
		{
			IList<UserLoginInfo> list = new List<UserLoginInfo>();
			return Task.FromResult(list);
		}

		public Task<AppUser> FindAsync(UserLoginInfo login)
		{
			if (login.LoginProvider == "PhoneNumber")
				return FindByPhoneNumberAsync(login.ProviderKey);
			else if (login.LoginProvider == "UserName")
				return FindByNameAsync(login.ProviderKey);
			else if (login.LoginProvider == "Email")
				return FindByEmailAsync(login.ProviderKey);
			else
				return _dbContext.LoadAsync<AppUser>(DataSource, $"[{DbSchema}].[FindUserByLogin]", new { login.LoginProvider, login.ProviderKey });
		}
		#endregion

		#region IUserLockoutStore
		public Task<DateTimeOffset> GetLockoutEndDateAsync(AppUser user)
		{
			return Task.FromResult<DateTimeOffset>(user.LockoutEndDateUtc);
		}

		public Task SetLockoutEndDateAsync(AppUser user, DateTimeOffset lockoutEnd)
		{
			if (user.LockoutEndDateUtc != lockoutEnd)
			{
				user.LockoutEndDateUtc = lockoutEnd;
				user.SetModified(UserModifiedFlag.Lockout);
			}
			return Task.FromResult<Int32>(0);
		}

		public Task<Int32> IncrementAccessFailedCountAsync(AppUser user)
		{
			user.AccessFailedCount += 1;
			user.SetModified(UserModifiedFlag.Lockout);
			return Task.FromResult(user.AccessFailedCount);
		}

		public Task ResetAccessFailedCountAsync(AppUser user)
		{
			if (user.AccessFailedCount != 0)
			{
				user.AccessFailedCount = 0;
				user.SetModified(UserModifiedFlag.Lockout);
			}
			return Task.CompletedTask;
		}

		public Task<Int32> GetAccessFailedCountAsync(AppUser user)
		{
			return Task.FromResult(user.AccessFailedCount);
		}

		public Task<Boolean> GetLockoutEnabledAsync(AppUser user)
		{
			return Task.FromResult(user.LockoutEnabled);
		}

		public Task SetLockoutEnabledAsync(AppUser user, Boolean enabled)
		{
			user.LockoutEnabled = enabled;
			return Task.CompletedTask;
		}
		#endregion

		#region IUserPasswordStore
		public Task SetPasswordHashAsync(AppUser user, String passwordHash)
		{
			user.PasswordHash = passwordHash;
			user.SetModified(UserModifiedFlag.Password);
			return Task.CompletedTask;
		}

		public Task<String> GetPasswordHashAsync(AppUser user)
		{
			return Task.FromResult(user.PasswordHash);
		}

		public Task<Boolean> HasPasswordAsync(AppUser user)
		{
			return Task.FromResult(user.PasswordHash != null);

		}
		#endregion

		#region IUserTwoFactorStore
		public Task SetTwoFactorEnabledAsync(AppUser user, Boolean enabled)
		{
			user.TwoFactorEnabled = enabled;
			return Task.CompletedTask;
		}

		public Task<Boolean> GetTwoFactorEnabledAsync(AppUser user)
		{
			return Task.FromResult(user.TwoFactorEnabled);
		}
		#endregion

		#region IUserEmailStore
		public Task SetEmailAsync(AppUser user, String email)
		{
			user.Email = email;
			return Task.CompletedTask;
		}

		public Task<String> GetEmailAsync(AppUser user)
		{
			String mail = user.Email;
			if (String.IsNullOrEmpty(mail))
				mail = user.UserName; // user name as email
			return Task.FromResult(mail);
		}

		public Task<Boolean> GetEmailConfirmedAsync(AppUser user)
		{
			return Task.FromResult(user.EmailConfirmed);
		}

		public Task SetEmailConfirmedAsync(AppUser user, Boolean confirmed)
		{
			user.EmailConfirmed = confirmed;
			user.SetModified(UserModifiedFlag.EmailConfirmed);
			return Task.CompletedTask;
		}

		public async Task<AppUser> FindByEmailAsync(String email)
		{
			var emaillwoer = (email ?? String.Empty).ToLowerInvariant();
			AppUser user = _cache.GetByEmail(email);
			if (user != null)
				return user;
			user = await _dbContext.LoadAsync<AppUser>(DataSource, $"[{DbSchema}].[FindUserByEmail]", new { Email = email });
			CacheUser(user);
			return user;
		}

		#endregion

		public async Task<AppUser> FindByPhoneNumberAsync(String phone)
		{
			AppUser user = _cache.GetByPhoneNumber(phone);
			if (user != null)
				return user;
			user = await _dbContext.LoadAsync<AppUser>(DataSource, $"[{DbSchema}].[FindUserByPhoneNumber]", new { PhoneNumber = phone });
			CacheUser(user);
			return user;
		}


		#region IUserPhoneNumberStore
		public Task SetPhoneNumberAsync(AppUser user, String phoneNumber)
		{
			if (user.PhoneNumber != phoneNumber)
			{
				user.PhoneNumber = phoneNumber;
				user.SetModified(UserModifiedFlag.PhoneNumber);
			}
			return Task.CompletedTask;
		}

		public Task<String> GetPhoneNumberAsync(AppUser user)
		{
			return Task.FromResult(user.PhoneNumber);
		}

		public Task<Boolean> GetPhoneNumberConfirmedAsync(AppUser user)
		{
			return Task.FromResult(user.PhoneNumberConfirmed);
		}

		public Task SetPhoneNumberConfirmedAsync(AppUser user, Boolean confirmed)
		{
			if (user.PhoneNumberConfirmed != confirmed)
			{
				user.PhoneNumberConfirmed = confirmed;
				user.SetModified(UserModifiedFlag.PhoneNumber);
			}
			return Task.CompletedTask;
		}
		#endregion

		#region IUserSecurityStampStore
		public Task SetSecurityStampAsync(AppUser user, String stamp)
		{
			if (user.SecurityStamp != stamp)
			{
				user.SecurityStamp = stamp;
				user.SetModified(UserModifiedFlag.Password);
			}
			return Task.CompletedTask;
		}

		public Task<String> GetSecurityStampAsync(AppUser user)
		{
			return Task.FromResult(user.SecurityStamp);
		}
		#endregion


		async Task AddAppClaims(AppUser user, List<Claim> list, String claims)
		{
			foreach (var s in claims.Split(','))
			{
				var claim = s.Trim().ToLowerInvariant();
				switch (claim)
				{
					case "groups":
						await AddGroupsToClaims(user, list);
						break;
				}
			}
		}

		async Task AddGroupsToClaims(AppUser user, List<Claim> claims)
		{
			var groups = await _dbContext.LoadListAsync<AppRole>(DataSource, $"[{DbSchema}].[GetUserGroups]", new { UserId = user.Id });
			var glist = groups.Where(role => !String.IsNullOrEmpty(role.Key) && role.Key != "Users").Select(role => role.Key.ToLowerInvariant());
			String gstr = String.Join(",", glist);
			claims.Add(new Claim("groups", gstr));
		}

		#region IUserClaimStore 
		/* 
		 * Add all the elements that may be needed WITHOUT loading the object.
		 * Access via: var user = HttpContext.Current.User.Identity as ClaimsIdentity;
		 */
		public async Task<IList<Claim>> GetClaimsAsync(AppUser user)
		{
			List<Claim> list = new List<Claim>
			{
				new Claim("PersonName", user.PersonName ?? String.Empty),
				new Claim("TenantId", user.Tenant.ToString()),
				new Claim("Segment", user.Segment ?? String.Empty)
			};
			if (user.IsAdmin)
				list.Add(new Claim("Admin", "Admin"));
			if (!String.IsNullOrEmpty(user.Locale))
				list.Add(new Claim("Locale", user.Locale.Replace('_', '-'))); // legacy db-values
			if (_host.IsMultiTenant)
			{
				var clientId = user.GetClientId();
				if (clientId != null)
					list.Add(new Claim("ClientId", clientId));
				if (user.IsTenantAdmin)
					list.Add(new Claim("TenantAdmin", "TenantAdmin"));
			}


			/*
			list.Add(new Claim("AppKey", user.ComputedAppKey));
			*/

			// there is not http context!
			var claims = ConfigurationManager.AppSettings["useClaims"];
			if (!String.IsNullOrEmpty(claims))
				await AddAppClaims(user, list, claims);
			return list;
		}

		public Task AddClaimAsync(AppUser user, Claim claim)
		{
			throw new NotImplementedException("AddClaimAsync");
		}

		public Task RemoveClaimAsync(AppUser user, Claim claim)
		{
			throw new NotImplementedException("RemoveClaimAsync");
		}
		#endregion

		#region IUserRoleStore

		IList<String> _userRoles = null;

		public Task AddToRoleAsync(AppUser user, String roleName)
		{
			_userRoles = null;
			throw new NotImplementedException(nameof(AddToRoleAsync));
		}

		public Task RemoveFromRoleAsync(AppUser user, String roleName)
		{
			_userRoles = null;
			throw new NotImplementedException(nameof(RemoveFromRoleAsync));
		}

		public async Task<IList<String>> GetRolesAsync(AppUser user)
		{
			if (_userRoles != null)
				return _userRoles;
			var list = await _dbContext.LoadListAsync<AppRole>(DataSource, $"[{DbSchema}].[GetUserGroups]", new { UserId = user.Id });
			_userRoles =  list.Where(x => !String.IsNullOrEmpty(x.Key)).Select<AppRole, String>(x => x.Key).ToList();
			return _userRoles;
		}

		public async Task<Boolean> IsInRoleAsync(AppUser user, String roleName)
		{
			IList<String> roles = await GetRolesAsync(user);
			return roles.IndexOf(roleName) != -1;
		}
		#endregion
	}
}

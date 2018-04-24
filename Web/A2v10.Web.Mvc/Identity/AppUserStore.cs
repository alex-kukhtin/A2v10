// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using Microsoft.AspNet.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Web.Mvc.Identity
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
			Dictionary<String, AppUser> _mapEmails = new Dictionary<String, AppUser>();
			Dictionary<Int64, AppUser> _mapIds = new Dictionary<Int64, AppUser>();

			public AppUser GetById(Int64 id)
			{
				AppUser user = null;
				if (_mapIds.TryGetValue(id, out user))
					return user;
				return null;
			}
			public AppUser GetByName(String name)
			{
				AppUser user = null;
				if (_mapNames.TryGetValue(name, out user))
					return user;
				return null;
			}

			public AppUser GetByEmail(String email)
			{
				AppUser user = null;
				if (_mapEmails.TryGetValue(email, out user))
					return user;
				return null;
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
					if (!Comparer<AppUser>.Equals(user, existing))
						throw new InvalidProgramException("Invalid user cache");
				}
				if (!_mapNames.ContainsKey(user.UserName))
				{
					_mapNames.Add(user.UserName, user);
				}
				if (!String.IsNullOrWhiteSpace(user.Email) && !_mapEmails.ContainsKey(user.Email))
				{
					_mapEmails.Add(user.Email, user);
				}
				else
				{
					var existing = _mapIds[user.Id];
					if (!Comparer<AppUser>.Equals(user, existing))
						throw new InvalidProgramException("Invalid user cache");
				}
			}
		}

		IDbContext _dbContext;
		IApplicationHost _host;

		UserCache _cache;

		public AppUserStore(IDbContext dbContext, IApplicationHost host)
		{
			_dbContext = dbContext;
			_host = host;
			_cache = new UserCache();
		}

		internal String DataSource => _host.CatalogDataSource;

		#region IUserStore

		public async Task CreateAsync(AppUser user)
		{
			await _dbContext.ExecuteAsync(DataSource, "[a2security].[CreateUser]", user);
			if (_host.IsMultiTenant)
			{
				var createdUser = await FindByIdAsync(user.Id);
				_host.TenantId = createdUser.Tenant;
				// TODO: GetTenantSegment!!!!
				await _dbContext.ExecuteAsync(null, "[a2security].[CreateTenantUser]", createdUser);
				CacheUser(createdUser);
			}
			else
			{
				CacheUser(user);
			}
		}

		public Task DeleteAsync(AppUser user)
		{
			throw new NotImplementedException();
		}

		public async Task<AppUser> FindByIdAsync(Int64 userId)
		{
			AppUser user = _cache.GetById(userId);
			if (user != null)
				return user;
			user = await _dbContext.LoadAsync<AppUser>(DataSource, "[a2security].[FindUserById]", new { Id = userId });
			CacheUser(user);
			return user;
		}

		public async Task<AppUser> FindByNameAsync(String userName)
		{
			AppUser user = _cache.GetByName(userName);
			if (user != null)
				return user;
			user = await _dbContext.LoadAsync<AppUser>(DataSource, "[a2security].[FindUserByName]", new { UserName = userName });
			CacheUser(user);
			return user;
		}

		public async Task UpdateAsync(AppUser user)
		{
			if (user.IsLockoutModified)
			{
				await _dbContext.ExecuteAsync<AppUser>(DataSource, "[a2security].[UpdateUserLockout]", user);
				user.ClearModified(UserModifiedFlag.Lockout);
			}
			else if (user.IsPasswordModified)
			{
				await _dbContext.ExecuteAsync<AppUser>(DataSource, "[a2security].[UpdateUserPassword]", user);
				user.ClearModified(UserModifiedFlag.Password);
			}
			else if (user.IsLastLoginModified)
			{
				await _dbContext.ExecuteAsync<AppUser>(DataSource, "[a2security].[UpdateUserLogin]", user);
				user.ClearModified(UserModifiedFlag.LastLogin);

			}
			else if (user.IsEmailConfirmModified)
			{
				await _dbContext.ExecuteAsync<AppUser>(DataSource, "[a2security].[ConfirmEmail]", user);
				user.ClearModified(UserModifiedFlag.EmailConfirmed);
			}
		}

		#endregion

		void CacheUser(AppUser user)
		{
			_cache.CacheUser(user);
		}

		#region IDisposable Support
		private bool disposedValue = false; // To detect redundant calls

		protected virtual void Dispose(bool disposing)
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
		public Task AddLoginAsync(AppUser user, UserLoginInfo login)
		{
			throw new NotImplementedException();
		}

		public Task RemoveLoginAsync(AppUser user, UserLoginInfo login)
		{
			throw new NotImplementedException();
		}

		public Task<IList<UserLoginInfo>> GetLoginsAsync(AppUser user)
		{
			IList<UserLoginInfo> list = new List<UserLoginInfo>();
			return Task.FromResult(list);
		}

		public Task<AppUser> FindAsync(UserLoginInfo login)
		{
			throw new NotImplementedException();
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
			return Task.FromResult(0);
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
			return Task.FromResult(0);
		}
		#endregion

		#region IUserPasswordStore
		public Task SetPasswordHashAsync(AppUser user, String passwordHash)
		{
			user.PasswordHash = passwordHash;
			user.SetModified(UserModifiedFlag.Password);
			return Task.FromResult(0);
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
		public Task SetTwoFactorEnabledAsync(AppUser user, bool enabled)
		{
			user.TwoFactorEnabled = enabled;
			return Task.FromResult(0);
		}

		public Task<bool> GetTwoFactorEnabledAsync(AppUser user)
		{
			return Task.FromResult(user.TwoFactorEnabled);
		}
		#endregion

		#region IUserEmailStore
		public Task SetEmailAsync(AppUser user, String email)
		{
			user.Email = email;
			return Task.FromResult(0);
		}

		public Task<String> GetEmailAsync(AppUser user)
		{
			return Task.FromResult(user.Email);
		}

		public Task<bool> GetEmailConfirmedAsync(AppUser user)
		{
			return Task.FromResult(user.EmailConfirmed);
		}

		public Task SetEmailConfirmedAsync(AppUser user, bool confirmed)
		{
			user.EmailConfirmed = confirmed;
			user.SetModified(UserModifiedFlag.EmailConfirmed);
			return Task.FromResult(0);
		}

		public async Task<AppUser> FindByEmailAsync(String email)
		{
			AppUser user = _cache.GetByEmail(email);
			if (user != null)
				return user;
			user = await _dbContext.LoadAsync<AppUser>(DataSource, "[a2security].[FindUserByEmail]", new { Email = email });
			CacheUser(user);
			return user;
		}

		#endregion

		#region IUserPhoneNumberStore
		public Task SetPhoneNumberAsync(AppUser user, String phoneNumber)
		{
			user.PhoneNumber = phoneNumber;
			return Task.FromResult(0);
		}

		public Task<String> GetPhoneNumberAsync(AppUser user)
		{
			return Task.FromResult(user.PhoneNumber);
		}

		public Task<Boolean> GetPhoneNumberConfirmedAsync(AppUser user)
		{
			return Task.FromResult(user.PhoneNumberConfirmed);
		}

		public Task SetPhoneNumberConfirmedAsync(AppUser user, bool confirmed)
		{
			user.PhoneNumberConfirmed = confirmed;
			return Task.FromResult(0);
		}
		#endregion

		#region IUserSecurityStampStore
		public Task SetSecurityStampAsync(AppUser user, String stamp)
		{
			user.SecurityStamp = stamp;
			user.SetModified(UserModifiedFlag.Password);
			return Task.FromResult(0);
		}

		public Task<String> GetSecurityStampAsync(AppUser user)
		{
			return Task.FromResult(user.SecurityStamp);
		}
		#endregion

		#region IUserClaimStore 
		public Task<IList<Claim>> GetClaimsAsync(AppUser user)
		{
			//TODO:
			/* добавляем все элементы, которые могут быть нужны БЕЗ загрузки объекта 
             * доступ через 
             * var user = HttpContext.Current.User.Identity as ClaimsIdentity;
             */
			IList<Claim> list = new List<Claim>();
			list.Add(new Claim("PersonName", user.PersonName ?? String.Empty));
			list.Add(new Claim("TenantId", user.Tenant.ToString()));
			if (user.IsAdmin)
				list.Add(new Claim("Admin", "Admin"));
			/*
			list.Add(new Claim("Locale", user.Locale ?? "uk_UA"));
			list.Add(new Claim("AppKey", user.ComputedAppKey));
			*/
			return Task.FromResult(list);
		}

		public Task AddClaimAsync(AppUser user, Claim claim)
		{
			throw new NotImplementedException();
		}

		public Task RemoveClaimAsync(AppUser user, Claim claim)
		{
			throw new NotImplementedException();
		}
		#endregion

		#region IUserRoleStore

		public Task AddToRoleAsync(AppUser user, String roleName)
		{
			throw new NotImplementedException();
		}

		public Task RemoveFromRoleAsync(AppUser user, String roleName)
		{
			throw new NotImplementedException();
		}

		public async Task<IList<String>> GetRolesAsync(AppUser user)
		{
			var list = await _dbContext.LoadListAsync<AppRole>(DataSource, "[a2security].[GetUserGroups]", new { UserId = user.Id });
			return list.Select<AppRole, String>(x => x.Name).ToList();
		}

		public async Task<Boolean> IsInRoleAsync(AppUser user, String roleName)
		{
			IList<String> roles = await GetRolesAsync(user);
			return roles.IndexOf(roleName) != -1;
		}
		#endregion
	}
}

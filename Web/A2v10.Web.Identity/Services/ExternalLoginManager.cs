// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;

using A2v10.Infrastructure;
using A2v10.Data.Interfaces;

namespace A2v10.Web.Identity
{
	public class ExternalLoginManager : IExternalLoginManager
	{
		AppUserManager _userManager;
		AppSignInManager _signInManager;

		private readonly IDbContext _dbContext;

		public ExternalLoginManager(IDbContext dbContext)
		{
			_dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
		}

		AppUserManager UserManager
		{
			get
			{
				if (_userManager == null)
					_userManager = HttpContext.Current.GetOwinContext().GetUserManager<AppUserManager>();
				return _userManager;
			}
		}

		AppSignInManager SignInManager
		{
			get
			{
				if (_signInManager == null)
					_signInManager = HttpContext.Current.GetOwinContext().Get<AppSignInManager>();
				return _signInManager;
			}
		}

		public async Task<String> GenerateToken(String loginProvider, String providerKey)
		{
			AppUser user = await UserManager.FindAsync(new UserLoginInfo(loginProvider, providerKey));
			if (user == null)
				throw new InvalidOperationException("Generate user failed");
			return await UserManager.GenerateUserTokenAsync(loginProvider, user.Id);
		}

		public async Task<Boolean> SignInUserAsync(String loginProvider, String providerKey, String token, IRequestInfo request)
		{
			AppUser user = await UserManager.FindAsync(new UserLoginInfo(loginProvider, providerKey));
			if (user == null)
				return false;
			// TODO: generate token
			//Boolean result = await UserManager.VerifyUserTokenAsync(user.Id, loginProvider, token);
			//if (result)
			//{
			await SignInManager.SignInAsync(user, false, false);
			if (request != null)
			{
				user.LastLoginDate = DateTime.Now;
				user.LastLoginHost = request.HostText;
				await _userManager.UpdateAsync(user);
			}
			return true;
			//}
			//return result;
		}

		public async Task<Boolean> IsUserExistsAsync(String loginProvider, String providerKey)
		{
			AppUser user = await UserManager.FindAsync(new UserLoginInfo(loginProvider, providerKey));
			return user != null;
		}

		public async Task<Boolean> CreateUserAsync(String loginProvider, ExternalUserInfo user)
		{
			var foundUser = await UserManager.FindAsync(new UserLoginInfo("PhoneNumber", user.PhoneNumber));
			if (foundUser != null)
			{
				await UserManager.AddLoginAsync(foundUser.Id, new UserLoginInfo(loginProvider, user.ProviderKey));
				return true;
			}

			foundUser = await UserManager.FindAsync(new UserLoginInfo("UserName", user.Email.ToLowerInvariant()));
			if (foundUser != null)
			{
				await UserManager.AddLoginAsync(foundUser.Id, new UserLoginInfo(loginProvider, user.ProviderKey));
				return true;
			}

			var userToCreate = new AppUser
			{
				UserName = user.UserName,
				Email = user.Email,
				PhoneNumber = user.PhoneNumber,
				PersonName = user.PersonName,
				Tenant = -1,
				RegisterHost = loginProvider
			};

			var result = await UserManager.CreateAsync(userToCreate, user.Password);
			if (!result.Succeeded)
				return false;
			var createdUser = UserManager.FindByName(userToCreate.UserName);
			String token = await UserManager.GenerateEmailConfirmationTokenAsync(createdUser.Id);
			await UserManager.AddLoginAsync(createdUser.Id, new UserLoginInfo(loginProvider, user.ProviderKey));
			await UserManager.ConfirmEmailAsync(createdUser.Id, token);
			await UserManager.UpdateAsync(createdUser);
			return true;
		}
	}
}

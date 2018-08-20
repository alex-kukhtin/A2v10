// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Security.Claims;

using Microsoft.Owin.Security;
using Microsoft.Owin;
using Microsoft.AspNet.Identity.Owin;

using System.Threading.Tasks;

namespace A2v10.Web.Identity
{
	public class AppSignInManager : SignInManager<AppUser, Int64>
	{
		public AppSignInManager(AppUserManager userManager, IAuthenticationManager authenticationManager)
			: base(userManager, authenticationManager)
		{
		}

		public override Task<ClaimsIdentity> CreateUserIdentityAsync(AppUser user)
		{
			return user.GenerateUserIdentityAsync((AppUserManager)UserManager);
		}

		public static AppSignInManager Create(IdentityFactoryOptions<AppSignInManager> options, IOwinContext context)
		{
			return new AppSignInManager(context.GetUserManager<AppUserManager>(), context.Authentication);
		}
	}
}

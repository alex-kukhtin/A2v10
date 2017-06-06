using System;
using System.Security.Claims;
using Microsoft.AspNet.Identity.Owin;
using System.Threading.Tasks;
using Microsoft.Owin.Security;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Owin;

namespace A2v10.Web.Mvc.Identity
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

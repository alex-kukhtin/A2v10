// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Threading.Tasks;

using Microsoft.Owin;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;

using A2v10.Infrastructure;
using A2v10.Data.Interfaces;

namespace A2v10.Web.Mvc.Identity
{
	public class AppUserManager : UserManager<AppUser, Int64>
	{
		public AppUserManager(IUserStore<AppUser, Int64> store)
			: base(store)
		{
		}

		public static AppUserManager Create(IdentityFactoryOptions<AppUserManager> options, IOwinContext context)
		{
			IDbContext dbContext = ServiceLocator.Current.GetService<IDbContext>();
			IApplicationHost host = ServiceLocator.Current.GetService<IApplicationHost>();
			AppUserStore store = new AppUserStore(dbContext, host);
			AppUserManager manager = new AppUserManager(store);
			manager.Construct(options);
			return manager;
		}

		public async Task UpdateUser(AppUser user)
		{
			await Store.UpdateAsync(user);
		}

		void Construct(IdentityFactoryOptions<AppUserManager> options)
		{
			// Configure validation logic for usernames
			UserValidator = new UserValidator<AppUser, Int64>(this)
			{
				AllowOnlyAlphanumericUserNames = false,
				RequireUniqueEmail = true
			};

			// Configure validation logic for passwords
			PasswordValidator = new PasswordValidator
			{
				RequiredLength = 6 //TODO:,
								   //RequireNonLetterOrDigit = true,
								   //RequireDigit = true,
								   //RequireLowercase = true,
								   //RequireUppercase = true,
			};

			// Configure user lockout defaults
			UserLockoutEnabledByDefault = true;
			DefaultAccountLockoutTimeSpan = TimeSpan.FromMinutes(5);
			MaxFailedAccessAttemptsBeforeLockout = 5;

			/*
            // Register two factor authentication providers. This application uses Phone and Emails as a step of receiving a code for verifying the user
            // You can write your own provider and plug it in here.
            manager.RegisterTwoFactorProvider("Phone Code", new PhoneNumberTokenProvider<ApplicationUser>
            {
                MessageFormat = "Your security code is {0}"
            });
            manager.SmsService = new SmsService();
            */
			RegisterTwoFactorProvider("Email Code", new EmailTokenProvider<AppUser, Int64>
			{
				Subject = "Security Code",
				BodyFormat = "Your security code is {0}"
			});
			ILogger logger = ServiceLocator.Current.GetService<ILogger>();
			EmailService = new EmailService(logger);

			var dataProtectionProvider = options.DataProtectionProvider;
			if (dataProtectionProvider != null)
			{
				UserTokenProvider =
					new DataProtectorTokenProvider<AppUser, Int64>(dataProtectionProvider.Create("ASP.NET Identity"));
			}
		}
	}
}

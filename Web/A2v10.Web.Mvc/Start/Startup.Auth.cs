// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using System;
using System.Configuration;
using System.Web;

using Owin;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin;
using Microsoft.Owin.Security.Cookies;

using A2v10.Web.Identity;

namespace A2v10.Web.Mvc.Start
{
	public partial class Startup
	{
		public void ConfigureAuth(IAppBuilder app)
		{
			// Configure the db context, user manager and signin manager to use a single instance per request
			app.CreatePerOwinContext<AppUserManager>(AppUserManager.Create);
			app.CreatePerOwinContext<AppSignInManager>(AppSignInManager.Create);

			// Enable the application to use a cookie to store information for the signed in user
			// and to use a cookie to temporarily store information about a user logging in with a third party login provider

			var authProvider = new CookieAuthenticationProvider
			{
				// Enables the application to validate the security stamp when the user logs in.
				// This is a security feature which is used when you change a password or add an external login to your account.  
				OnValidateIdentity = SecurityStampValidator.OnValidateIdentity<AppUserManager, AppUser, Int64>
					(
						validateInterval: TimeSpan.FromMinutes(30),
						getUserIdCallback: (user) =>
						{
							return user.GetUserId<Int64>();
						},
						regenerateIdentityCallback: (manager, user) => user.GenerateUserIdentityAsync(manager)
					),
				OnResponseSignedIn = (context) =>
				{
				}
			};

			var originalHandler = authProvider.OnApplyRedirect;

			authProvider.OnApplyRedirect = (context) =>
			{
				var refer = context.Request.Query["ref"];
				var loginPath = context.Options.LoginPath;
				String qs = $"{context.Options.ReturnUrlParameter}={HttpUtility.UrlEncode(context.Request.Path.Value)}";
				if (refer != null)
					qs += $"&ref={HttpUtility.UrlEncode(refer)}";
				String url = loginPath.Add(new QueryString(qs));
				context.Response.Redirect(url);
			};

			app.UseCookieAuthentication(new CookieAuthenticationOptions
			{
				AuthenticationType = DefaultAuthenticationTypes.ApplicationCookie,
				LoginPath = new PathString("/account/login"),
				Provider = authProvider,
				CookieName = GetApplicationCookieName()
			});
			//app.UseExternalSignInCookie(DefaultAuthenticationTypes.ExternalCookie);
			//AntiForgeryConfig.UniqueClaimTypeIdentifier = ClaimTypes.NameIdentifier; // 

			// Enables the application to temporarily store user information when they are verifying the second factor in the two-factor authentication process.
			//app.UseTwoFactorSignInCookie(DefaultAuthenticationTypes.TwoFactorCookie, TimeSpan.FromMinutes(5));

			// Enables the application to remember the second login verification factor such as phone or email.
			// Once you check this option, your second step of verification during the login process will be remembered on the device where you logged in from.
			// This is similar to the RememberMe option when you log in.
			//app.UseTwoFactorRememberBrowserCookie(DefaultAuthenticationTypes.TwoFactorRememberBrowserCookie);

			// Uncomment the following lines to enable logging in with third party login providers
			//app.UseMicrosoftAccountAuthentication(
			//    clientId: "",
			//    clientSecret: "");

			//app.UseTwitterAuthentication(
			//   consumerKey: "",
			//   consumerSecret: "");

			//app.UseFacebookAuthentication(
			//   appId: "",
			//   appSecret: "");

			//app.UseGoogleAuthentication(new GoogleOAuth2AuthenticationOptions()
			//{
			//    ClientId = "",
			//    ClientSecret = ""
			//});

			app.UseCacheForStaticFiles();

			String GetApplicationCookieName()
			{
				var key = ConfigurationManager.AppSettings["AppKey"];
				return $"{key}.ASP.NET.ApplicationCookie";
			}
		}
	}
}

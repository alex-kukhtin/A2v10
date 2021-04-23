// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using System;
using System.Configuration;
using System.Threading.Tasks;
using System.Web;

using Owin;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin;
using Microsoft.Owin.Security.Cookies;
using Microsoft.Owin.Security.OAuth;

using A2v10.Web.Identity;
using A2v10.Web.Mvc.OAuth2;
using A2v10.Web.Identity.ApiKey;

namespace A2v10.Web.Mvc.Start
{
	public static partial class Startup
	{
		public static void ConfigureAuth(IAppBuilder app)
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

			//var originalHandler = authProvider.OnApplyRedirect;

			authProvider.OnApplyRedirect = (context) =>
			{
				if (context.Request.SkipAuthRedirect())
					return;
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
				ReturnUrlParameter = "returnurl",
				Provider = authProvider,
				CookieName = GetApplicationCookieName(),
			});


			//app.UseExternalSignInCookie(DefaultAuthenticationTypes.ExternalCookie);
			//AntiForgeryConfig.UniqueClaimTypeIdentifier = ClaimTypes.NameIdentifier; // 

			// Enables the application to temporarily store user information when they are verifying the second factor in the two-factor authentication process.
			//app.UseTwoFactorSignInCookie(DefaultAuthenticationTypes.TwoFactorCookie, TimeSpan.FromMinutes(5));

			app.UseCacheForStaticFiles();

			String GetApplicationCookieName()
			{
				var key = ConfigurationManager.AppSettings["AppKey"];
				return $"{key}.ASP.NET.ApplicationCookie";
			}

			if (ConfigurationManager.GetSection("oauth2") is Oauth2Section oauth2Config)
			{
				var expTimeSpan = oauth2Config.expireTimeSpan;
				if (expTimeSpan.TotalMilliseconds == 0)
					expTimeSpan = TimeSpan.FromMinutes(20);

				app.UseOAuthBearerTokens(new OAuthAuthorizationServerOptions()
				{
					Provider = new OAuth2Provider(),
					TokenEndpointPath = new PathString(oauth2Config.tokenEndpoint),
					AllowInsecureHttp = oauth2Config.allowInsecureHttp,
					AccessTokenExpireTimeSpan = expTimeSpan
				});
			}

			if (ConfigurationManager.AppSettings["enableApiKeyAuth"] == "true")
			{
				var opts = new ApiKeyAuthenticationOptions()
				{
					UnauthorizedCode = 403
				};
				opts.Provider.OnValidateIdentity = (context) => DbValidateApiKey.ValidateApiKey(context);
				app.UseApiKeyAuthentication(opts);
			}
		}
	}
}

// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

using System;
using System.Configuration;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;

using Owin;
using Microsoft.Owin;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.Cookies;
using Microsoft.Owin.Security.OAuth;
using Microsoft.Owin.Security.OpenIdConnect;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;

using Newtonsoft.Json;

using A2v10.Web.Identity;
using A2v10.Web.Mvc.OAuth2;
using A2v10.Web.Identity.ApiKey;
using A2v10.Web.Identity.ApiBasic;
using A2v10.Infrastructure;
using A2v10.Data.Interfaces;

namespace A2v10.Web.Mvc.Start
{
	public static partial class Startup
	{
		private static void ConfigureDefaultAuth(IAppBuilder app)
		{
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
                // new values
                CookieSameSite = Microsoft.Owin.SameSiteMode.None,
                CookieSecure = CookieSecureOption.Always,
                /*
                ExpireTimeSpan = TimeSpan.FromSeconds(20),
                CookieDomain = "thishost:81"
                */
            });

			String GetApplicationCookieName()
			{
				var key = ConfigurationManager.AppSettings["AppKey"];
				return $"{key}.ASP.NET.ApplicationCookie";
			}
		}

		private static void ConfigureOpenApiAuth(IAppBuilder app, String strConfig)
		{
			app.SetDefaultSignInAsAuthenticationType(CookieAuthenticationDefaults.AuthenticationType);
			app.UseCookieAuthentication(new CookieAuthenticationOptions());

			var openIdConfig = OpenIdConfig.FromString(strConfig);
			var opts = new OpenIdConnectAuthenticationOptions()
			{
				ClientId = openIdConfig.clientId,
				Authority = openIdConfig.aadInstance + openIdConfig.tenantId + "/v2.0",
				PostLogoutRedirectUri = openIdConfig.redirectUri,
				RedirectUri = openIdConfig.redirectUri,
				Scope = OpenIdConnectScope.OpenIdProfile,
				ResponseType = OpenIdConnectResponseType.CodeIdToken,
				Notifications = new OpenIdConnectAuthenticationNotifications()
				{
					RedirectToIdentityProvider = (context) =>
					{
						return Task.FromResult(0);
					},
					MessageReceived = (context) =>
					{
						return Task.FromResult(0);
					},
					SecurityTokenReceived = (context) =>
					{
						return Task.FromResult(0);
					},
					SecurityTokenValidated = async (context) =>
					{
						var identity = context.AuthenticationTicket.Identity;
						var userManager = context.OwinContext.GetUserManager<AppUserManager>();
						var userName = identity.FindFirstValue("preferred_username");
						var appUser = await userManager.FindByNameAsync(userName);
						if (appUser == null)
						{
							appUser = new AppUser()
							{
								UserName = userName,
								PersonName = identity.FindFirstValue("name")
							};
							await userManager.CreateAsync(appUser);
							appUser = await userManager.FindByNameAsync(userName);
						}
						var claims = await userManager.GetClaimsAsync(appUser.Id);
						var openIdId = identity.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier");
						if (openIdId != null) {
							identity.TryRemoveClaim(openIdId);
							identity.AddClaim(new Claim("OpenIdIdentifier", openIdId.Value));
						}
						identity.AddClaim(new Claim("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier", "99"));
						identity.AddClaim(new Claim(ClaimsIdentity.DefaultNameClaimType, appUser.UserName));
						foreach (var c in claims)
							identity.AddClaim(new Claim(c.Type, c.Value));
						//"OpenIdIdentifier"
					},
					AuthorizationCodeReceived = (context) =>
					{
						return Task.FromResult(0);
					},
					AuthenticationFailed = (context) =>
					{
						return Task.FromResult(0);
					},
				}
			};
			app.UseOpenIdConnectAuthentication(opts);
		}

		private static void ConfigureOauth2(IAppBuilder app)
		{
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
		}

		private static void ConfigureApi(IAppBuilder app)
		{
			var apiAuth = ConfigurationManager.AppSettings["apiAuthentication"];
			if (apiAuth == null)
				return;
			var apiAuthKeys = apiAuth.Split(',');
			if (apiAuthKeys.Any(x => x.Equals("APIKEY", StringComparison.InvariantCultureIgnoreCase)))
			{
				var opts = new ApiKeyAuthenticationOptions()
				{
					UnauthorizedCode = 403
				};
				app.UseApiKeyAuthentication(opts);
			}
			if (apiAuthKeys.Any(x => x.Equals("BASIC", StringComparison.InvariantCultureIgnoreCase)))
			{
				var opts = new ApiBasicAuthenticationOptions()
				{
					UnauthorizedCode = 403
				};
				app.UseApiBasicAuthentication(opts);
			}
		}

		public static void ConfigureAuth(IAppBuilder app)
		{
			// Configure the db context, user manager and signin manager to use a single instance per request
			app.CreatePerOwinContext<AppUserManager>(AppUserManager.Create);
			app.CreatePerOwinContext<AppSignInManager>(AppSignInManager.Create);

			app.UseCacheForStaticFiles();


			var openIdAuth = ConfigurationManager.AppSettings["openIdAuthentication"];
			if (openIdAuth != null)
				ConfigureOpenApiAuth(app, openIdAuth);
			else
				ConfigureDefaultAuth(app);

			ConfigureOauth2(app);
			ConfigureApi(app);
		}
	}
}

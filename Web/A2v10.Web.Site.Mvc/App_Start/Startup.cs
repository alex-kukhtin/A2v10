
using Owin;
using Microsoft.Owin;
using A2v10.Web.Site.Mvc.Impl;

[assembly: OwinStartupAttribute(typeof(A2v10.Web.Site.Mvc.App_Start.Startup))]
namespace A2v10.Web.Site.Mvc.App_Start
{
   public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
            A2v10.Web.Mvc.Startup.Services.StartServices(opts =>
            {
                opts.TokenProvider = new CustomTokenProvider();
            });
        }

        public static void ConfigureAuth(IAppBuilder app)
        {
            // Configure the db context, user manager and signin manager to use a single instance per request
            //app.CreatePerOwinContext<AppUserManager>(UserManagerCreator.Create);
            //app.CreatePerOwinContext<AppSignInManager>(AppSignInManager.Create);

            // Enable the application to use a cookie to store information for the signed in user
            // and to use a cookie to temporarily store information about a user logging in with a third party login provider
            // Configure the sign in cookie
            /*
            app.UseCookieAuthentication(new CookieAuthenticationOptions
            {
                AuthenticationType = DefaultAuthenticationTypes.ApplicationCookie,
                LoginPath = new PathString("/account/login"),
                Provider = new CookieAuthenticationProvider
                {
                    // Enables the application to validate the security stamp when the user logs in.
                    // This is a security feature which is used when you change a password or add an external login to your account.  
                    OnValidateIdentity = SecurityStampValidator.OnValidateIdentity<AppUserManager, AppUser, Int64>(
                        validateInterval: TimeSpan.FromMinutes(30),
                        getUserIdCallback: (user) => user.GetUserId<Int64>(),
                        regenerateIdentityCallback: (manager, user) => user.GenerateUserIdentityAsync(manager)
                    ),
                    OnApplyRedirect = (context) => {
                        if (context.Request.Path.StartsWithSegments(new PathString("/api/v2")))
                            return;
                        var loginPath = context.Options.LoginPath;
                        String returnUrl = $"{context.Options.ReturnUrlParameter}={HttpUtility.UrlEncode(context.Request.Path.Value)}";
                        String url = loginPath.Add(new QueryString(returnUrl));
                        context.Response.Redirect(url);
                    }
                }
            });
            */

            //app.UseCacheForStaticFiles();

            /*
            var opts = new ApiKeyAuthenticationOptions()
            {
                UnauthorizedCode = 403
            };
            app.UseApiKeyAuthentication(opts);

            var opts2 = new ApiBasicAuthenticationOptions()
            {
                UnauthorizedCode = 403
            };
            app.UseApiBasicAuthentication(opts2);
            */
        }
    }
}
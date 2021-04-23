using A2v10.Web.Identity;
using A2v10.Web.Mvc.Filters;
using A2v10.Web.Mvc.Models;
using Microsoft.AspNet.Identity.Owin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace A2v10.Web.Mvc.Controllers
{
	class AccountController2 : Controller
	{
		public AppSignInManager SignInManager => HttpContext.GetOwinContext().Get<AppSignInManager>();

		public AppUserManager UserManager => HttpContext.GetOwinContext().GetUserManager<AppUserManager>();

		//
		// GET: /Account/SendCode
		[AllowAnonymous]
		/*public*/ async Task<ActionResult> SendCode(String returnUrl, Boolean? rememberMe)
		{
			var userId = await SignInManager.GetVerifiedUserIdAsync();
			if (userId == 0)
			{
				return View("Error");
			}
			var userFactors = await UserManager.GetValidTwoFactorProvidersAsync(userId);
			var factorOptions = userFactors.Select(purpose => new SelectListItem { Text = purpose, Value = purpose }).ToList();
			var rm = rememberMe != null ? rememberMe.Value : false;
			return View(new SendCodeViewModel { Providers = factorOptions, ReturnUrl = returnUrl, RememberMe = rm });
		}

		// GET: /Account/VerifyCode
		[AllowAnonymous]
		/*public*/ async Task<ActionResult> VerifyCode(String provider, String returnUrl, Boolean rememberMe)
		{
			// Require that the user has already logged in via username/password or external login
			if (!await SignInManager.HasBeenVerifiedAsync())
			{
				return View("Error");
			}
			return View(new VerifyCodeViewModel { Provider = provider, ReturnUrl = returnUrl, RememberMe = rememberMe });
		}

		// POST: /Account/VerifyCode
		[HttpPost]
		[AllowAnonymous]
		[ValidateJsonAntiForgeryToken]
		[HandlAntiForgeryExecptionAttribute]
		/*public*/ async Task<ActionResult> VerifyCode(VerifyCodeViewModel model)
		{
			if (!ModelState.IsValid)
			{
				return View(model);
			}

			// The following code protects for brute force attacks against the two factor codes. 
			// If a user enters incorrect codes for a specified amount of time then the user account 
			// will be locked out for a specified amount of time. 
			// You can configure the account lockout settings in IdentityConfig
			var result = await SignInManager.TwoFactorSignInAsync(model.Provider, model.Code, isPersistent: model.RememberMe, rememberBrowser: model.RememberBrowser);
			switch (result)
			{
				case SignInStatus.Success:
					return RedirectToLocal(model.ReturnUrl);
				case SignInStatus.LockedOut:
					return View("Lockout");
				case SignInStatus.Failure:
				default:
					ModelState.AddModelError("", "Invalid code.");
					return View(model);
			}
		}

		//
		// POST: /Account/SendCode
		[HttpPost]
		[AllowAnonymous]
		[ValidateJsonAntiForgeryToken]
		[HandlAntiForgeryExecptionAttribute]
		/*public*/ async Task<ActionResult> SendCode(SendCodeViewModel model)
		{
			if (!ModelState.IsValid)
			{
				return View();
			}

			// Generate the token and send it
			if (!await SignInManager.SendTwoFactorCodeAsync(model.SelectedProvider))
			{
				return View("Error");
			}
			return RedirectToAction("VerifyCode", new { Provider = model.SelectedProvider, model.ReturnUrl, model.RememberMe });
		}

		private ActionResult RedirectToLocal(String returnUrl)
		{
			if (Url.IsLocalUrl(returnUrl))
			{
				return Redirect(returnUrl);
			}
			return Redirect("~/");
		}
	}
}

// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using System.Threading;
using System.Security;
using System.ComponentModel.DataAnnotations;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Web.Helpers;
using System.Text;
using System.IO;

using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;

using Newtonsoft.Json;

using A2v10.Request;
using A2v10.Infrastructure;
using A2v10.Web.Mvc.Models;
using A2v10.Data.Interfaces;
using A2v10.Web.Mvc.Filters;
using A2v10.Web.Identity;

namespace A2v10.Web.Mvc.Controllers
{
	[Authorize]
	public class AccountController : IdentityController
	{

		IApplicationHost _host;
		IDbContext _dbContext;
		ILocalizer _localizer; 

		public AccountController()
		{
			// DI ready
			var serviceLocator = ServiceLocator.Current;
			_host = serviceLocator.GetService<IApplicationHost>();
			_dbContext = serviceLocator.GetService<IDbContext>();
			_localizer = serviceLocator.GetService<ILocalizer>();
		}

		public AccountController(AppUserManager userManager, AppSignInManager signInManager)
			: base(userManager, signInManager)
		{
			// DI ready
			var serviceLocator = ServiceLocator.Current;
			_host = serviceLocator.GetService<IApplicationHost>();
			_dbContext = serviceLocator.GetService<IDbContext>();
			_localizer = serviceLocator.GetService<ILocalizer>();
		}

		void SendPage(String rsrcHtml, String rsrcScript, String serverInfo = null, String errorMessage = null)
		{
			try
			{
				AntiForgery.GetTokens(null, out String cookieToken, out String formToken);

				AppTitleModel appTitle = _dbContext.Load<AppTitleModel>(_host.CatalogDataSource, "a2ui.[AppTitle.Load]");

				StringBuilder layout = new StringBuilder(_localizer.Localize(null, GetRedirectedPage("layout", ResourceHelper.InitLayoutHtml)));
				layout.Replace("$(Lang)", CurrentLang);
				layout.Replace("$(Build)", _host.AppBuild);
				layout.Replace("$(AssetsStyleSheets)", _host.AppStyleSheetsLink("applink"));
				StringBuilder html = new StringBuilder(rsrcHtml);
				layout.Replace("$(Partial)", html.ToString());
				layout.Replace("$(Title)", appTitle?.AppTitle);
				layout.Replace("$(Description)", _host.AppDescription);
				layout.Replace("$(ErrorMessage)", _localizer.Localize(null, errorMessage));
				layout.Replace("@(SiteMeta)", GetSiteMetaTags());


				String mtMode = _host.IsMultiTenant.ToString().ToLowerInvariant();
				String regMode = _host.IsRegistrationEnabled.ToString().ToLowerInvariant();

				StringBuilder script = new StringBuilder(rsrcScript);
				script.Replace("$(Utils)", ResourceHelper.pageUtils);
				script.Replace("$(Locale)", ResourceHelper.locale);
				script.Replace("$(Mask)", ResourceHelper.mask);

				script.Replace("$(PageData)", $"{{ version: '{_host.AppVersion}', title: '{appTitle?.AppTitle}', subtitle: '{appTitle?.AppSubTitle}', multiTenant: {mtMode}, registration: {regMode} }}");
				script.Replace("$(AppLinks)", _localizer.Localize(null, _host.AppLinks()));
				script.Replace("$(ServerInfo)", serverInfo ?? "null");
				script.Replace("$(Token)", formToken);
				layout.Replace("$(PageScript)", script.ToString());

				Response.Cookies.Add(new HttpCookie(AntiForgeryConfig.CookieName, cookieToken));

				Response.Write(layout.ToString());
			}
			catch (Exception ex)
			{
				Response.Write(ex.Message);
			}
		}

		String GetSiteMetaTags()
		{
			var host = Request.Headers["Host"];
			if (host == null)
				return String.Empty;
			Int32 dotPos = host.IndexOfAny(":".ToCharArray());
			if (dotPos != -1)
				host = host.Substring(0, dotPos);
			host = host.Replace('.', '_').ToLowerInvariant();
			String path = _host.MakeFullPath(false, "_meta/", $"{host}.head");
			if (System.IO.File.Exists(path))
				return System.IO.File.ReadAllText(path);
			return String.Empty;
		}

		String GetRedirectedPage(String pageName, String fallback)
		{
			String path = _host.MakeFullPath(false, "_platform/", $"{pageName}.{CurrentLang}.html");
			if (!System.IO.File.Exists(path))
				return fallback;
			String text = System.IO.File.ReadAllText(path) + "\r\n";
			Int32 ix = text.IndexOf("@PartialFile:");
			if (ix == -1)
				return text;
			StringBuilder sb = new StringBuilder();
			Int32 spIndex = text.IndexOfAny(" \n\r<>".ToCharArray(), ix);
			sb.Append(text.Substring(0, ix));
			String partialFileName = text.Substring(ix + 13, spIndex - ix - 13);
			String partialPath = _host.MakeFullPath(false, "_platform/", $"{partialFileName}.{CurrentLang}.html");
			sb.Append(System.IO.File.ReadAllText(partialPath));
			sb.Append(text.Substring(spIndex));
			return sb.ToString();
		}

		// GET: /Account/Login
		[AllowAnonymous]
		[HttpGet]
		[OutputCache(Duration = 0)]
		public void Login()
		{
			Session.Abandon();
			ClearAllCookies();
			String page = GetRedirectedPage("login", ResourceHelper.LoginHtml);
			SendPage(page, ResourceHelper.LoginScript);
		}

		// POST: /Account/Login
		[ActionName("Login")]
		[HttpPost]
		[IsAjaxOnly]
		[AllowAnonymous]
		[ValidateJsonAntiForgeryToken]
		public async Task<ActionResult> LoginPOST()
		{
			LoginViewModel model;
			using (var tr = new StreamReader(Request.InputStream))
			{
				String json = tr.ReadToEnd();
				model = JsonConvert.DeserializeObject<LoginViewModel>(json);
			}
			// LOWER CASE!
			model.Name = model.Name.ToLower();
			var user = await UserManager.FindByNameAsync(model.Name);
			if (user == null)
				return Json(new { Status = "Failure" });

			if (!user.EmailConfirmed)
				return Json(new { Status = "EmailNotConfirmed" });

			String status = null;

			var result = await SignInManager.PasswordSignInAsync(userName: model.Name, password: model.Password, isPersistent: model.RememberMe, shouldLockout: true);
			switch (result)
			{
				case SignInStatus.Success:
					await UpdateUser(user, success: true);
					ClearRVTCookie();
					status = "Success";
					break;
				case SignInStatus.LockedOut:
					await UpdateUser(model.Name);
					status = "LockedOut";
					break;
				case SignInStatus.RequiresVerification:
					throw new NotImplementedException("SignInStatus.RequiresVerification");
				case SignInStatus.Failure:
				default:
					await UpdateUser(model.Name);
					status = "Failure";
					break;
			}
			return Json(new { Status = status });
		}

		void ClearAllCookies()
		{
			var expires = DateTime.Now.AddDays(-1d);
			foreach (var key in Request.Cookies.AllKeys)
			{
				var c = Response.Cookies[key];
				if (c != null)
					c.Expires = expires;
			}
		}

		void ClearRVTCookie()
		{
			var cc = Response.Cookies["__RequestVerificationToken"];
			if (cc != null)
				cc.Expires = DateTime.Now.AddDays(-1d);
		}

		// GET: /Account/VerifyCode
		[AllowAnonymous]
		public async Task<ActionResult> VerifyCode(String provider, String returnUrl, Boolean rememberMe)
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
		public async Task<ActionResult> VerifyCode(VerifyCodeViewModel model)
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

		[AllowAnonymous]
		[HttpGet]
		[OutputCache(Duration = 0)]
		public void Register()
		{
			if (!_host.IsMultiTenant)
			{
				Response.Write("Turn on the multiTenant mode");
				return;
			}
			if (!_host.IsRegistrationEnabled)
			{
				Response.Write("Registration is disabled in this site");
				return;
			}
			String page = GetRedirectedPage("register", ResourceHelper.RegisterTenantHtml);
			SendPage(page, ResourceHelper.RegisterTenantScript);
		}

		static ConcurrentDictionary<String, DateTime> _ddosChecker = new ConcurrentDictionary<String, DateTime>();

		public Int32 IsDDOS()
		{
			String host = Request.UserHostAddress;
			var now = DateTime.Now;
			if (_ddosChecker.TryGetValue(host, out DateTime time)) {
				var timeOffest = now - time;
				if (timeOffest.TotalSeconds < 60)
				{
					//_ddosChecker.AddOrUpdate(host, now, (key, value) => now);
					return Convert.ToInt32(timeOffest.TotalSeconds);
				}
				else
				{
					// remove current
					_ddosChecker.TryRemove(host, out DateTime xVal);
					return 0;
				}
			}
			else
			{
				_ddosChecker.AddOrUpdate(host, now, (key, value) => now);
			}
			ClearDDOSCache();
			return 0;
		}

		void ClearDDOSCache()
		{
			var now = DateTime.Now;
			// clear old values
			var keysForDelete = new List<String>();
			foreach (var dd in _ddosChecker)
			{
				var offset = now - dd.Value;
				if (offset.Seconds > 120)
					keysForDelete.Add(dd.Key);
			}
			foreach (var key in keysForDelete)
				_ddosChecker.TryRemove(key, out DateTime outVal);
		}

		void SaveDDOSTime()
		{
			String host = Request.UserHostAddress;
			var now = DateTime.Now;
			_ddosChecker.AddOrUpdate(host, now, (key, value) => now);
		}

		void RemoveDDOSTime()
		{
			String host = Request.UserHostAddress;
			_ddosChecker.TryRemove(host, out DateTime dt);
		}


		// POST: /Register/Login
		[ActionName("Register")]
		[HttpPost]
		[IsAjaxOnly]
		[AllowAnonymous]
		[ValidateJsonAntiForgeryToken]
		public async Task<ActionResult> RegisterPOST()
		{
			String status;
			var seconds = IsDDOS();
			if (seconds > 0)
				return Json(new { Status = "DDOS" }); //, Seconds = seconds });
			if (!_host.IsRegistrationEnabled)
				return Json(new { Status = "DISABLED" }); //
			try
			{
				RegisterTenantModel model;
				using (var tr = new StreamReader(Request.InputStream))
				{
					String json = tr.ReadToEnd();
					model = JsonConvert.DeserializeObject<RegisterTenantModel>(json);
				}

				// LOWER case
				model.Name = model.Name.ToLower();

				if (!IsEmailValid(model.Name) || !IsEmailValid(model.Email))
				{
					RemoveDDOSTime();
					throw new InvalidDataException("InvalidEmail");
				}

				// create user with tenant
				var user = new AppUser
				{
					UserName = model.Name,
					Email = model.Email,
					PhoneNumber = model.Phone,
					PersonName = model.PersonName,
					Tenant = -1,
					RegisterHost = Request.UrlReferrer.Host
				};

				if (String.IsNullOrEmpty(user.Email))
					user.Email = model.Name;

				var phoneUser = await UserManager.FindAsync(new UserLoginInfo("PhoneNumber", model.Phone));
				if (phoneUser != null)
				{
					RemoveDDOSTime();
					throw new InvalidDataException("PhoneNumberAlreadyTaken");
				}


				var result = await UserManager.CreateAsync(user, model.Password);

				if (result.Succeeded)
				{
					// email confirmation
					String confirmCode = await UserManager.GenerateEmailConfirmationTokenAsync(user.Id);
					var callbackUrl = Url.Action("confirmemail", "account", new { userId = user.Id, code = confirmCode }, Request.Url.Scheme);

					String subject = _localizer.Localize(null, "@[ConfirmEMail]");
					String body = GetEMailBody("confirmemail", "@[ConfirmEMailBody]")
						.Replace("{0}", callbackUrl);

					await UserManager.SendEmailAsync(user.Id, subject, body);

					SaveDDOSTime();

					status = "ConfirmSent";
				}
				else
				{
					status = String.Join(", ", result.Errors);
					foreach (var e in result.Errors) {
						if (e.Contains("is already taken"))
						{
							RemoveDDOSTime();
							status = "AlreadyTaken";
							break;
						}
					}
				}
			}
			catch (Exception ex)
			{
				status = ex.Message;
			}
			return Json(new { Status = status });
		}

		//
		// GET: /Account/ConfirmEmail
		[AllowAnonymous]
		[HttpGet]
		[OutputCache(Duration = 0)]
		public async Task ConfirmEmail(Int64? userId, String code)
		{
			try
			{
				if (userId == null || code == null)
				{
					SendPage(GetRedirectedPage("error", ResourceHelper.ErrorHtml), ResourceHelper.SimpleScript);
					return;
				}
				var user = await UserManager.FindByIdAsync(userId.Value);
				if (user.EmailConfirmed)
				{
					SendPage(GetRedirectedPage("error", ResourceHelper.ErrorHtml), ResourceHelper.SimpleScript, null, "@[EMailAlreadyConfirmed]");
					return;
				}

				var result = await UserManager.ConfirmEmailAsync(userId.Value, code);
				if (result.Succeeded)
				{
					user = await UserManager.FindByIdAsync(userId.Value);
					await UserManager.UpdateUser(user);

					String subject = _localizer.Localize(null, "@[InviteEMail]");
					String body = GetEMailBody("invite", null);
					if (!String.IsNullOrEmpty(body))
					{
						var inviteCallback = Url.Action("Default", "Shell", routeValues:null, protocol: Request.Url.Scheme);
						body = body.Replace("{0}", inviteCallback);
						await UserManager.SendEmailAsync(user.Id, subject, body);
					}

					SendPage(GetRedirectedPage("confirmemail", ResourceHelper.ConfirmEMailHtml), ResourceHelper.SimpleScript);
					return;
				}
				SendPage(GetRedirectedPage("error", ResourceHelper.ErrorHtml), ResourceHelper.SimpleScript);
			}
			catch (Exception /*ex*/)
			{
				SendPage(GetRedirectedPage("error", ResourceHelper.ErrorHtml), ResourceHelper.SimpleScript);
			}
		}

		[AllowAnonymous]
		[HttpGet]
		[OutputCache(Duration = 0)]
		public void ForgotPassword()
		{
			String page = GetRedirectedPage("forgotpassword", ResourceHelper.ForgotPasswordHtml);
			SendPage(page, ResourceHelper.ForgotPasswordScript);
		}

		//
		// POST: /Account/ForgotPassword
		[ActionName("ForgotPassword")]
		[HttpPost]
		[IsAjaxOnly]
		[AllowAnonymous]
		[ValidateJsonAntiForgeryToken]
		public async Task<ActionResult> ForgotPasswordPOST()
		{
			String status;
			try
			{
				ForgotPasswordViewModel model;
				using (var tr = new StreamReader(Request.InputStream))
				{
					String json = tr.ReadToEnd();
					model = JsonConvert.DeserializeObject<ForgotPasswordViewModel>(json);
				}
				// LOWER CASE!
				model.Name = model.Name.ToLower();
				var user = await UserManager.FindByNameAsync(model.Name);
				if (user == null || !(await UserManager.IsEmailConfirmedAsync(user.Id)))
				{
					// Don't reveal that the user does not exist or is not confirmed
					status = _host.IsDebugConfiguration ? "NotFound" : "Success";
				}
				else if (!user.ChangePasswordEnabled)
					status = "NotAllowed";
				else
				{
					String code = await UserManager.GeneratePasswordResetTokenAsync(user.Id);
					var callbackUrl = Url.Action("ResetPassword", "Account", new { userId = user.Id, code }, protocol: Request.Url.Scheme);
					String subject = _localizer.Localize(null, "@[ResetPassword]");
					String body = _localizer
						.Localize(null, "@[ResetPasswordBody]")
						.Replace("{0}", callbackUrl);
					await UserManager.SendEmailAsync(user.Id, subject, body);
					status = "Success";
				}
			}
			catch (Exception ex)
			{
				status = ex.Message;
			}
			return Json(new { Status = status });
		}

		//
		// GET: /Account/ResetPassword
		[AllowAnonymous]
		[HttpGet]
		[OutputCache(Duration = 0)]
		public void ResetPassword(String code)
		{
			if (code == null)
				return;
			String serverInfo = $"{{token: '{code}'}}";
			String page = GetRedirectedPage("resetpassword", ResourceHelper.ResetPasswordHtml);
			SendPage(page, ResourceHelper.ResetPasswordScript, serverInfo);
		}

		//
		// POST: /Account/ResetPassword
		[ActionName("ResetPassword")]
		[HttpPost]
		[IsAjaxOnly]
		[AllowAnonymous]
		[ValidateJsonAntiForgeryToken]
		public async Task<ActionResult> ResetPasswordPOST()
		{
			String status = null;
			try
			{
				ResetPasswordViewModel model;
				using (var tr = new StreamReader(Request.InputStream))
				{
					String json = tr.ReadToEnd();
					model = JsonConvert.DeserializeObject<ResetPasswordViewModel>(json);
				}
				// LOWER CASE!
				model.Name = model.Name.ToLower();
				var user = await UserManager.FindByNameAsync(model.Name);
				if (user == null || String.IsNullOrEmpty(model.Code))
				{
					// Don't reveal that the user does not exist
					status = _host.IsDebugConfiguration ? "Error" : "Success";
				}
				else
				{
					var result = await UserManager.ResetPasswordAsync(user.Id, model.Code, model.Password);
					if (result.Succeeded)
					{
						await UserManager.UpdateUser(user);
						status = "Success";
					}
					else
					{
						foreach ( var e in result.Errors)
						{
							if (e.Contains("Invalid token"))
								status = "InvalidToken";
						}
						if (status == null)
							status = String.Join(", ", result.Errors);
					}
				}
			}
			catch (Exception ex)
			{
				status = ex.Message;
			}
			return Json(new { Status = status });
		}

		[HttpPost]
		[Authorize]
		[IsAjaxOnly]
		public async Task<ActionResult> ChangePassword()
		{
			String status;
			try
			{
				ChangePasswordViewModel model;
				using (var tr = new StreamReader(Request.InputStream))
				{
					String json = tr.ReadToEnd();
					model = JsonConvert.DeserializeObject<ChangePasswordViewModel>(json);
				}
				if (User.Identity.GetUserId<Int64>() != model.Id)
					throw new SecurityException("Invalid User Id");
				var user = await UserManager.FindByIdAsync(model.Id);
				if (user == null)
					throw new SecurityException("User not found");

				if (!user.ChangePasswordEnabled)
					throw new SecurityException("Change password not allowed");

				var ir = await UserManager.ChangePasswordAsync(model.Id, model.OldPassword, model.NewPassword);
				if (ir.Succeeded)
				{
					await UserManager.UpdateAsync(user);
					status = "Success";
				}
				else
				{
					status = String.Join(", ", ir.Errors);
				}
			}
			catch (Exception ex)
			{
				status = ex.Message;
			}
			return Json(new { Status = status });
		}

		//
		// GET: /Account/SendCode
		[AllowAnonymous]
		public async Task<ActionResult> SendCode(String returnUrl, Boolean? rememberMe)
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

		//
		// POST: /Account/SendCode
		[HttpPost]
		[AllowAnonymous]
		[ValidateJsonAntiForgeryToken]
		public async Task<ActionResult> SendCode(SendCodeViewModel model)
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

		[HttpPost]
		public ActionResult LogOff()
		{
			AuthenticationManager.SignOut(DefaultAuthenticationTypes.ApplicationCookie);
			return RedirectToLocal("~/");
		}

		#region helpers

		private void AddErrors(IdentityResult result)
		{
			foreach (var error in result.Errors)
			{
				ModelState.AddModelError(String.Empty, error);
			}
		}

		private ActionResult RedirectToLocal(String returnUrl)
		{
			if (Url.IsLocalUrl(returnUrl))
			{
				return Redirect(returnUrl);
			}
			return Redirect("~/");
		}

		async Task UpdateUser(String userName, Boolean? success = null)
		{
			var user = await UserManager.FindByNameAsync(userName);
			if (user != null)
			{
				await UpdateUser(user, success);
			}
		}

		async Task UpdateUser(AppUser user, Boolean? success = null)
		{ 
			// may be locked out
			if (success.HasValue)
			{
				user.LastLoginDate = DateTime.Now;
				if (Request.UserHostName == Request.UserHostAddress)
					user.LastLoginHost = $"{Request.UserHostName}";
				else
					user.LastLoginHost = $"{Request.UserHostName} [{Request.UserHostAddress}]";
			}
			await UserManager.UpdateUser(user);
		}

		String CurrentLang
		{
			get
			{
				var culture = Thread.CurrentThread.CurrentUICulture;
				var lang = culture.TwoLetterISOLanguageName;
				return lang;
			}
		}

		Boolean IsEmailValid(String mail)
		{
			var ema = new EmailAddressAttribute();
			return ema.IsValid(mail);
		}

		String GetEMailBody(String code, String dictName)
		{
			String emailFile = _host.MakeFullPath(false, "_emails", $"{code}.{CurrentLang}.html");
			String body;
			if (System.IO.File.Exists(emailFile))
			{
				body = System.IO.File.ReadAllText(emailFile);
			} else {
				if (dictName == null)
					return null;
				body = _localizer.Localize(null, dictName);
			}
			if (body.IndexOf("{0}") == - 1)
				throw new InvalidDataException($"Invalid email template for {code}");
			return body;
		}

		#endregion
	}
}
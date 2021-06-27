// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

using System;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using System.Security;
using System.ComponentModel.DataAnnotations;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Web.Helpers;
using System.Text;
using System.IO;
using System.Configuration;
using System.Dynamic;
using System.Threading;

using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;

using Newtonsoft.Json;

using A2v10.Request;
using A2v10.Infrastructure;
using A2v10.Web.Mvc.Models;
using A2v10.Data.Interfaces;
using A2v10.Web.Mvc.Filters;
using A2v10.Web.Identity;
using A2v10.Web.Base;
using A2v10.Web.Config;

namespace A2v10.Web.Mvc.Controllers
{
	public class ETag
	{
		public String Name { get; set; }
		public String Value { get; set; }
	}

	[Authorize]
	[CheckMobileFilter]
	[ExecutingFilter]
	public class AccountController : IdentityController, IControllerTenant, IControllerLocale
	{
		private readonly IApplicationHost _host;
		private readonly IDbContext _dbContext;
		private readonly ILocalizer _localizer;
		private readonly IUserStateManager _userStateManager;
		private readonly IUserLocale _userLocale;

		private const String LOCALE_COOKIE = "_locale";
		private const String QUERYSTRING_COOKIE = "_originurl";

		private const String USERNAME_SESSIONKEY = "_username";

		public AccountController()
		{
			// DI ready
			var serviceLocator = ServiceLocator.Current;
			_host = serviceLocator.GetService<IApplicationHost>();
			_dbContext = serviceLocator.GetService<IDbContext>();
			_localizer = serviceLocator.GetService<ILocalizer>();
			_userStateManager = serviceLocator.GetService<IUserStateManager>();
			_userLocale = serviceLocator.GetService<IUserLocale>();
			_host.StartApplication(false);
		}

		public AccountController(AppUserManager userManager, AppSignInManager signInManager)
			: base(userManager, signInManager)
		{
			// DI ready
			var serviceLocator = ServiceLocator.Current;
			_host = serviceLocator.GetService<IApplicationHost>();
			_dbContext = serviceLocator.GetService<IDbContext>();
			_localizer = serviceLocator.GetService<ILocalizer>();
			_host.StartApplication(false);
		}

		String AvalableLocales()
		{
			var avail = ConfigurationManager.AppSettings["availableLocales"];
			if (String.IsNullOrEmpty(avail))
				return String.Empty;
			return $"const avaliableLocales = [{String.Join(",", avail.Split(',').Select(x => $"'{x.Trim()}'"))}];";
		}

		Boolean IsAnalyticsEnabled()
		{
			var analytics = ConfigurationManager.AppSettings["analytics"];
			if (String.IsNullOrEmpty(analytics))
				return false;
			return analytics == "enable";
		}

		void SendPage(String rsrcHtml, String rsrcScript, String serverInfo = null, String errorMessage = null)
		{
			try
			{
				AntiForgery.GetTokens(null, out String cookieToken, out String formToken);

				AppTitleModel appTitle = _dbContext.Load<AppTitleModel>(_host.CatalogDataSource, "a2ui.[AppTitle.Load]");

				var layoutHtml = _host.Mobile ? ResourceHelper.InitLayoutMobileHtml : ResourceHelper.InitLayoutHtml;

				StringBuilder layout = new StringBuilder(_localizer.Localize(null, GetRedirectedPage("layout", layoutHtml)));
				layout.Replace("$(Lang)", _userLocale.Language);
				StringBuilder html = new StringBuilder(rsrcHtml);
				layout.Replace("$(Partial)", html.ToString());
				layout.Replace("$(Title)", appTitle?.AppTitle);
				layout.Replace("$(ErrorMessage)", _localizer.Localize(null, errorMessage));
				layout.Replace("$(SiteMeta)", Request.GetSiteMetaTags(_host));
				_host.ReplaceMacros(layout, "applink");

				String mtMode = _host.IsMultiTenant.ToString().ToLowerInvariant();
				String regMode = _host.IsRegistrationEnabled.ToString().ToLowerInvariant();

				StringBuilder script = new StringBuilder(rsrcScript);
				script.Replace("$(Utils)", ResourceHelper.PageUtils);
				script.Replace("$(Locale)", ResourceHelper.LocaleLibrary(_userLocale.Language));
				script.Replace("$(Mask)", ResourceHelper.Mask);
				script.Replace("$(AvailableLocales)", AvalableLocales());
				script.Replace("$(UserEmail)", Session[USERNAME_SESSIONKEY]?.ToString());

				script.Replace("$(PageData)", $"{{ version: '{_host.AppVersion}', title: '{appTitle?.AppTitle}', subtitle: '{appTitle?.AppSubTitle}', multiTenant: {mtMode}, registration: {regMode} }}");
				script.Replace("$(AppLinks)", _localizer.Localize(null, _host.AppLinks()));
				script.Replace("$(AppData)", _host.GetAppData(_localizer));
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

		String GetRedirectedPage(String pageName, String fallback)
		{
			var mobileSuffix = _host.Mobile ? ".mobile" : String.Empty;
			String redirectedText = _host.ApplicationReader.ReadTextFile("_platform/", $"{pageName}.{_userLocale.Language}{mobileSuffix}.html");
			if (redirectedText == null)
				return fallback;
			String text = redirectedText + "\r\n";
			Int32 ix = text.IndexOf("@PartialFile:");
			if (ix == -1)
				return text;
			StringBuilder sb = new StringBuilder();
			Int32 spIndex = text.IndexOfAny(" \n\r<>".ToCharArray(), ix);
			sb.Append(text.Substring(0, ix));
			String partialFileName = text.Substring(ix + 13, spIndex - ix - 13);
			String partialPathText = _host.ApplicationReader.ReadTextFile("_platform/", $"{partialFileName}.{_userLocale.Language}{mobileSuffix}.html");
			sb.Append(partialPathText);
			sb.Append(text.Substring(spIndex));
			return sb.ToString();
		}

		// GET: /Account/Login
		[AllowAnonymous]
		[HttpGet]
		[OutputCache(Duration = 0)]
		public void Login(String Referral, String lang)
		{
			if (User.Identity.IsAuthenticated)
			{
				AuthenticationManager.SignOut(DefaultAuthenticationTypes.ApplicationCookie);
				Response.Redirect("/account/login");
				return;
			}
			Session.Abandon();
			ClearAllCookies();
			String page = GetRedirectedPage("login", _host.Mobile ? ResourceHelper.LoginMobileHtml : ResourceHelper.LoginHtml);
			SetQueryStringCookie();
			SendPage(page, ResourceHelper.LoginScript);
		}

		// POST: /Account/Login
		[ActionName("login")]
		[HttpPost]
		[IsAjaxOnly]
		[AllowAnonymous]
		[ValidateJsonAntiForgeryToken]
		[HandlAntiForgeryExecptionAttribute]
		public async Task<ActionResult> LoginPOST()
		{
			String status = null;

			try
			{
				LoginViewModel model = GetModelFromBody<LoginViewModel>();

				// LOWER CASE!
				model.Name = model.Name.ToLower();
				var user = await UserManager.FindByNameAsync(model.Name);

				// Find by Phone Number
				// await UserManager.FindAsync(new UserLoginInfo("PhoneNumber", model.Name));

				if (user == null)
					return Json(new { Status = "Failure" });

				if (!user.EmailConfirmed)
				{
					Session.Add(USERNAME_SESSIONKEY, user.UserName);
					return Json(new { Status = "EmailNotConfirmed" });
				}

				var result = await SignInManager.PasswordSignInAsync(userName: model.Name, password: model.Password, isPersistent: model.RememberMe, shouldLockout: true);
				switch (result)
				{
					case SignInStatus.Success:
						await UpdateUser(user, success: true);
						await CallHook("loginSuccess", user);
						ClearRVTCookie();
						status = "Success";
						break;
					case SignInStatus.LockedOut:
						await UpdateUser(model.Name);
						await CallHook("loginLockedOut", user);
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
			}
			catch (Exception ex)
			{
				if (ex.InnerException != null)
					ex = ex.InnerException;
				status = ex.Message;
			}
			return Json(new { Status = status });
		}


		void ClearAllCookies()
		{
			var expires = DateTime.Now.AddDays(-1d);
			foreach (var key in Request.Cookies.AllKeys)
			{
				if (key == LOCALE_COOKIE)
					continue;
				if (key == QUERYSTRING_COOKIE)
					continue;
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


		[AllowAnonymous]
		[HttpGet]
		[OutputCache(Duration = 0)]
		public void Register()
		{
			if (User.Identity.IsAuthenticated)
			{
				AuthenticationManager.SignOut(DefaultAuthenticationTypes.ApplicationCookie);
				Response.Redirect("/account/register");
				return;
			}

			if (!_host.IsMultiTenant)
			{
				Response.Write("Turn on the multiTenant mode");
				return;
			}
			if (!_host.IsRegistrationEnabled)
			{
				Response.Write("Registration is disabled");
				return;
			}

			Session.Abandon();
			ClearAllCookies();

			SetQueryStringCookie();
			String page = GetRedirectedPage("register", ResourceHelper.RegisterTenantHtml);
			SendPage(page, ResourceHelper.RegisterTenantScript);
		}

		static ConcurrentDictionary<String, DateTime> _ddosChecker = new ConcurrentDictionary<String, DateTime>();

		public Int32 IsDDOS()
		{
			String host = Request.UserHostAddress;
			var now = DateTime.Now;
			if (_ddosChecker.TryGetValue(host, out DateTime time))
			{
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

		async Task SaveReferral(Int64 userId, String referral)
		{
			if (String.IsNullOrEmpty(referral))
				return;
			var uri = new UserReferralInfo()
			{
				UserId = userId,
				Referral = referral
			};
			await _dbContext.ExecuteAsync<UserReferralInfo>(_host.CatalogDataSource, "a2security.SaveReferral", uri);
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


		async Task SendConfirmCode(AppUser user)
		{
			// and email confirmation link too
			String emailConfirmLink = await UserManager.GenerateEmailConfirmationTokenAsync(user.Id);
			String confirmCode = await UserManager.GenerateTwoFactorTokenAsync(user.Id, AppUserManager.TWOFACTORPROVIDERS.EMailCode);

			var callbackUrl = Url.Action("confirmemaillink", "account", new { userId = user.Id, code = emailConfirmLink }, Request.Url.Scheme);

			String subject = _localizer.Localize(null, "@[ConfirmEMail]");
			StringBuilder sbBody = new StringBuilder(GetEMailBody("confirmemail", "@[ConfirmEMailBody]"));
			sbBody.Replace("{0}", confirmCode)
				.Replace("$(EMail)", user.UserName)
				.Replace("$(SmsCode)", confirmCode)
				.Replace("$(ConfirmLink)", callbackUrl);

			await UserManager.SendEmailAsync(user.Id, subject, sbBody.ToString());
		}

		// POST: /Register/Login
		[ActionName("register")]
		[HttpPost]
		[IsAjaxOnly]
		[AllowAnonymous]
		[ValidateJsonAntiForgeryToken]
		[HandlAntiForgeryExecptionAttribute]
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
				RegisterTenantModel model = GetModelFromBody<RegisterTenantModel>();

				// LOWER case
				model.Name = model.Name.ToLower();
				model.Referral = model.Referral.ToLower();

				if (!IsEmailValid(model.Name) || !IsEmailValid(model.Email))
				{
					RemoveDDOSTime();
					throw new InvalidDataException("InvalidEmail");
				}

				// delete user if possible
				var checkEO = new ExpandoObject();
				checkEO.Set("UserName", model.Name);
				await _dbContext.ExecuteExpandoAsync(_host.CatalogDataSource, "a2security.[User.CheckRegister]", checkEO);

				if (!String.IsNullOrEmpty(model.Locale))
				{
					Response.Cookies.Add(new HttpCookie(LOCALE_COOKIE, model.Locale));
					_userLocale.Locale = model.Locale;
				}

				// create user with tenant
				var user = new AppUser
				{
					UserName = model.Name,
					Email = model.Email,
					PhoneNumber = model.Phone,
					PersonName = model.PersonName,
					Tenant = -1,
					RegisterHost = Request.UrlReferrer.Host,
					Locale = _userLocale.Locale ?? Thread.CurrentThread.CurrentUICulture.Name
				};

				if (String.IsNullOrEmpty(user.Email))
					user.Email = model.Name;

				if (!String.IsNullOrEmpty(model.Phone))
				{
					var phoneUser = await UserManager.FindAsync(new UserLoginInfo("PhoneNumber", model.Phone));
					if (phoneUser != null)
					{
						RemoveDDOSTime();
						throw new InvalidDataException("PhoneNumberAlreadyTaken");
					}
				}

				var result = await UserManager.CreateAsync(user, model.Password);

				if (result.Succeeded)
				{
					await SendConfirmCode(user);

					await SaveReferral(user.Id, model.Referral);
					SaveDDOSTime();

					Session.Add(USERNAME_SESSIONKEY, user.UserName);
					await CallHook("registerStart", user);
					status = "ConfirmSent";
				}
				else
				{
					status = String.Join(", ", result.Errors);
					foreach (var e in result.Errors)
					{
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


		String GetUserNameFromSession()
		{
			var userName = Session[USERNAME_SESSIONKEY];
			if (userName == null)
				return null;
			return userName.ToString();
		}

		[AllowAnonymous]
		[HttpPost]
		[OutputCache(Duration = 0)]
		public async Task<ActionResult> SendCodeAgain()
		{
			String status = "Success";
			try
			{
				var userName = GetUserNameFromSession();
				var user = await UserManager.FindByNameAsync(userName);
				if (user == null)
					status = "UserNotFound";
				else
					await SendConfirmCode(user);
			}
			catch (Exception ex)
			{
				status = ex.Message;
			}
			return Json(new { Status = status });
		}

		[AllowAnonymous]
		[HttpGet]
		[OutputCache(Duration = 0)]
		public async Task<ActionResult> ConfirmCode(Int64? userId)
		{
			try
			{
				var userName = GetUserNameFromSession();
				if (userName == null)
					return RedirectToLocal("~/account/register");

				var user = await UserManager.FindByNameAsync(userName.ToString());
				if (user == null)
					return RedirectToLocal("~/account/register");
				SendPage(GetRedirectedPage("confirmCode", ResourceHelper.ConfirmCodeHtml), ResourceHelper.ConfirmCodeScript);
			}
			catch (Exception /*ex*/)
			{
				// TODO: log error here!
				SendPage(GetRedirectedPage("error", ResourceHelper.ErrorHtml), ResourceHelper.SimpleScript);
			}
			return new EmptyResult();
		}

		// POST: /Account/ConfirmEmail
		[OutputCache(Duration = 0)]
		[ActionName("confirmcode")]
		[HttpPost]
		[IsAjaxOnly]
		[AllowAnonymous]
		[ValidateJsonAntiForgeryToken]
		[HandlAntiForgeryExecptionAttribute]
		public async Task<ActionResult> ConfirmCodePost()
		{
			String status = String.Empty;
			try
			{

				ConfirmEmailModel model = GetModelFromBody<ConfirmEmailModel>();

				if (model.Email == null)
					throw new SecurityException("Invalid e-Mail");
				if (model.Code == null)
					throw new SecurityException("Invalid code");

				// LOWER case
				model.Email = model.Email.ToLowerInvariant();

				var user = await UserManager.FindByNameAsync(model.Email);
				if (user == null || user.Id == 0)
					throw new SecurityException("User not found");

				if (user.EmailConfirmed)
					status = "EMailAlreadyConfirmed";
				else
				{
					var verified = await UserManager.VerifyTwoFactorTokenAsync(user.Id, AppUserManager.TWOFACTORPROVIDERS.EMailCode, model.Code);
					if (!verified)
						status = "InvalidConfirmCode";
					else
					{
						user.SetEMailConfirmed();
						await UserManager.UpdateUser(user);

						await CallHook("registerSuccess", user);
						await SaveQueryStringAnalytics(user);

						String subject = _localizer.Localize(null, "@[InviteEMail]");
						String body = GetEMailBody("invite", null);
						if (!String.IsNullOrEmpty(body))
						{
							var inviteCallback = Url.Action("default", "shell", routeValues: null, protocol: Request.Url.Scheme);
							body = body.Replace("{0}", inviteCallback);
							await UserManager.SendEmailAsync(user.Id, subject, body);
						}
						status = "Success";
					}
				}
				if (status == "Success")
				{
					// user already registered
					await SignInManager.SignInAsync(user, isPersistent: true, rememberBrowser: true);
					status = "LoggedIn";
				}
			}
			catch (Exception ex)
			{
				// TODO: log error here!
				status = ex.Message;
			}
			return Json(new { Status = status });
		}


		//
		// GET: /Account/ConfirmEmail
		[AllowAnonymous]
		[HttpGet]
		[OutputCache(Duration = 0)]
		public async Task ConfirmEmailLink(Int64? userId, String code)
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

					await CallHook("registerSuccess", user);
					await SaveQueryStringAnalytics(user);

					String subject = _localizer.Localize(null, "@[InviteEMail]");
					String body = GetEMailBody("invite", null);
					if (!String.IsNullOrEmpty(body))
					{
						var inviteCallback = Url.Action("default", "shell", routeValues: null, protocol: Request.Url.Scheme);
						body = body.Replace("{0}", inviteCallback);
						await UserManager.SendEmailAsync(user.Id, subject, body);
					}

					SendPage(GetRedirectedPage("confirmemail", ResourceHelper.ConfirmEMailHtml), ResourceHelper.SimpleScript);
					Session.Add(USERNAME_SESSIONKEY, user.UserName);
					return;
				}
				SendPage(GetRedirectedPage("error", ResourceHelper.ErrorHtml), ResourceHelper.SimpleScript);
			}
			catch (Exception /*ex*/)
			{
				// TODO: log error here!
				SendPage(GetRedirectedPage("error", ResourceHelper.ErrorHtml), ResourceHelper.SimpleScript);
			}
		}

		[AllowAnonymous]
		[HttpGet]
		[OutputCache(Duration = 0)]
		public void ForgotPassword()
		{
			String page = GetRedirectedPage("forgotpassword", _host.Mobile ? ResourceHelper.ForgotPasswordMobileHtml : ResourceHelper.ForgotPasswordHtml);
			SendPage(page, ResourceHelper.ForgotPasswordScript);
		}

		//
		// POST: /Account/ForgotPasswordCode
		[ActionName("forgotpasswordcode")]
		[HttpPost]
		[IsAjaxOnly]
		[AllowAnonymous]
		[ValidateJsonAntiForgeryToken]
		[HandlAntiForgeryExecptionAttribute]
		public async Task<ActionResult> ForgotPasswordCode()
		{
			String status = "Error";
			try
			{
				ConfirmEmailModel model = GetModelFromBody<ConfirmEmailModel>();
				// LOWER CASE!
				model.Email = model.Email.ToLower();
				var user = await UserManager.FindByNameAsync(model.Email);
				if (user != null)
				{
					var verified = await UserManager.VerifyTwoFactorTokenAsync(user.Id, AppUserManager.TWOFACTORPROVIDERS.EMailCode, model.Code);
					status = verified ? "Success" : "InvalidCode";
				}
				else
				{
					status = "UserNotFound";
				}
			}
			catch (Exception ex)
			{
				status = ex.Message;
			}
			return Json(new { Status = status });
		}

		//
		// POST: /Account/ForgotPassword
		[ActionName("forgotpassword")]
		[HttpPost]
		[IsAjaxOnly]
		[AllowAnonymous]
		[ValidateJsonAntiForgeryToken]
		[HandlAntiForgeryExecptionAttribute]
		public async Task<ActionResult> ForgotPasswordPOST()
		{
			String status;
			try
			{
				ForgotPasswordViewModel model = GetModelFromBody<ForgotPasswordViewModel>();
				// LOWER CASE!
				model.EMail = model.EMail.ToLower();
				var user = await UserManager.FindByNameAsync(model.EMail);
				if (user == null || !(await UserManager.IsEmailConfirmedAsync(user.Id)))
				{
					// Don't reveal that the user does not exist or is not confirmed
					status = _host.IsDebugConfiguration ? "NotFound" : "Success";
				}
				else if (!user.ChangePasswordEnabled)
					status = "NotAllowed";
				else
				{
					String code = await UserManager.GenerateTwoFactorTokenAsync(user.Id, AppUserManager.TWOFACTORPROVIDERS.EMailCode);
					String subject = _localizer.Localize(null, "@[ResetPassword]");
					String body = _localizer
						.Localize(null, "@[ResetPasswordBody]")
						.Replace("{0}", code);
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
		// POST: /Account/ResetPassword
		[ActionName("resetpassword")]
		[HttpPost]
		[IsAjaxOnly]
		[AllowAnonymous]
		[ValidateJsonAntiForgeryToken]
		[HandlAntiForgeryExecptionAttribute]
		public async Task<ActionResult> ResetPasswordPOST()
		{
			String status = null;
			try
			{
				ResetPasswordViewModel model = GetModelFromBody<ResetPasswordViewModel>();

				// LOWER CASE!
				model.EMail = model.EMail.ToLower();

				if (model.Password != model.Confirm)
					throw new SecurityException("InvalidConfirm");

				var user = await UserManager.FindByNameAsync(model.EMail);
				if (user == null || String.IsNullOrEmpty(model.Code))
				{
					// Don't reveal that the user does not exist
					status = _host.IsDebugConfiguration ? "Error" : "Success";
				}
				else
				{
					var verified = await UserManager.VerifyTwoFactorTokenAsync(user.Id, AppUserManager.TWOFACTORPROVIDERS.EMailCode, model.Code);
					if (verified)
					{
						var resetCode = await UserManager.GeneratePasswordResetTokenAsync(user.Id);
						var result = await UserManager.ResetPasswordAsync(user.Id, resetCode, model.Password);
						if (result.Succeeded)
						{
							await UserManager.UpdateUser(user);
							status = "Success";
						}
						else
						{
							foreach (var e in result.Errors)
							{
								if (e.Contains("Invalid token"))
									status = "InvalidToken";
							}
							if (status == null)
								status = String.Join(", ", result.Errors);
						}
					}
					else
					{
						status = "InvalidCode";
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
				ChangePasswordViewModel model = GetModelFromBody<ChangePasswordViewModel>();

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


		[HttpPost]
		public ActionResult LogOff()
		{
			AuthenticationManager.SignOut(DefaultAuthenticationTypes.ApplicationCookie);
			Session.Abandon();
			ClearAllCookies();
			Response.Cookies.Add(new HttpCookie(LOCALE_COOKIE, _userLocale.Locale));
			return Redirect("~/");
		}

		#region helpers

		private ActionResult RedirectToLocal(String returnUrl)
		{
			if (Url.IsLocalUrl(returnUrl))
				return Redirect(returnUrl);
			return Redirect("~/");
		}

		async Task UpdateUser(String userName, Boolean? success = null)
		{
			var user = await UserManager.FindByNameAsync(userName);
			if (user != null)
				await UpdateUser(user, success);
		}

		async Task UpdateUser(AppUser user, Boolean? success = null)
		{
			// may be locked out
			if (success.HasValue)
			{
				user.LastLoginDate = DateTime.UtcNow;
				if (Request.UserHostName == Request.UserHostAddress)
					user.LastLoginHost = $"{Request.UserHostName}";
				else
					user.LastLoginHost = $"{Request.UserHostName} [{Request.UserHostAddress}]";
			}
			await UserManager.UpdateUser(user);
		}

		Boolean IsEmailValid(String mail)
		{
			var ema = new EmailAddressAttribute();
			return ema.IsValid(mail);
		}

		String GetEMailBody(String code, String dictName)
		{
			String emailFileBody = _host.ApplicationReader.ReadTextFile("_emails", $"{code}.{_userLocale.Language}.html");
			String body;
			if (emailFileBody != null)
			{
				body = emailFileBody;
			}
			else
			{
				if (dictName == null)
					return null;
				body = _localizer.Localize(null, dictName);
			}
			return body;
		}

		// GET: /DemoMode
		[AllowAnonymous]
		public async Task<ActionResult> Demo()
		{
			String demo = ConfigurationManager.AppSettings["demo"];
			if (demo == null)
				return new HttpStatusCodeResult(404);
			var lp = demo.Split(';');
			if (lp.Length != 2)
				return new HttpStatusCodeResult(404);
			String userName = lp[0].Trim();
			String password = lp[1].Trim();
			var result = await SignInManager.PasswordSignInAsync(userName: userName, password: password, isPersistent: false, shouldLockout: false);
			switch (result)
			{
				case SignInStatus.Success:
					return Redirect("~/");
			}
			return new HttpStatusCodeResult(404);
		}

		#endregion

		#region IControllerTenant
		public void StartTenant()
		{
			var host = ServiceLocator.Current.GetService<IApplicationHost>();
			host.TenantId = TenantId;
			host.UserId = UserId;
			host.UserSegment = UserSegment;
		}
		#endregion

		#region IControllerLocale
		public void SetLocale()
		{
			if (User.Identity.IsAuthenticated)
			{
				_userLocale.Locale = User.Identity.GetUserLocale();
				return;
			}

			var rq = Request.QueryString["lang"];
			var loc = WebUserLocale.Lang2Locale(rq);
			if (loc != null)
			{
				Response.Cookies.Add(new HttpCookie(LOCALE_COOKIE, loc));
				_userLocale.Locale = loc;
				return;
			}

			var locale = Request.Cookies[LOCALE_COOKIE];
			if (locale != null)
			{
				// CheckValue
				_userLocale.Locale = WebUserLocale.CheckLocale(locale.Value);
				return;
			}
		}
		#endregion

		private T GetModelFromBody<T>()
		{
			using (var tr = new StreamReader(Request.InputStream))
			{
				String json = tr.ReadToEnd();
				return JsonConvert.DeserializeObject<T>(json);
			}
		}

		private async Task CallHook(String hookName, AppUser user)
		{
			var hooks = ConfigurationManager.AppSettings["accountHooks"];
			if (hooks == null || hooks != "enable")
				return;

			var rm = await RequestModel.CreateFromUrl(_host, false, RequestUrlKind.Simple, "_hooks");
			if (rm == null)
				return;
			var cmd = rm.GetCommand(hookName);
			if (cmd == null)
				return;
			var dbEvent = new DbEvent()
			{
				Source = _host.CatalogDataSource,
				ItemId = user.Id,
				Command = hookName,
				Path = "/_hooks"
			};

			/* add record to a2sys.DbEvents */
			await _dbContext.ExecuteAsync<DbEvent>(_host.CatalogDataSource, "a2sys.[DbEvent.Add]", dbEvent);
			/* and handle it */
			await _host.ProcessDbEvents(_dbContext, _host.CatalogDataSource);
		}


		void SetQueryStringCookie()
		{
			if (Request.Cookies.Get(QUERYSTRING_COOKIE) != null)
				return;
			if (!IsAnalyticsEnabled())
				return;
			if (Request.QueryString.Count == 0 || (Request.QueryString.Count == 1 && Request.QueryString["returnurl"] != null))
				return;
			Response.Cookies.Add(new HttpCookie(QUERYSTRING_COOKIE, Request.QueryString.ToString()));
		}

		async Task SaveQueryStringAnalytics(AppUser user)
		{
			if (!IsAnalyticsEnabled())
				return;
			var c = Request.Cookies.Get(QUERYSTRING_COOKIE);
			if (c == null)
				return;
			if (String.IsNullOrEmpty(c.Value))
				return;
			var qs = HttpUtility.ParseQueryString(c.Value);
			qs.Remove("returnurl");
			qs.Remove("lang");
			var list = new List<ETag>();
			for (var i=0; i<qs.Count; i++)
			{
				var key = qs.GetKey(i);
				var val = qs.Get(i);
				if (key.StartsWith("ET_", StringComparison.InvariantCultureIgnoreCase))
				{
					list.Add(new ETag() { Name = key, Value = val });
				}
			}
			var eo = new ExpandoObject();
			eo.Set("UserId", user.Id);
			eo.Set("Value", qs.ToString());
			await _dbContext.SaveListAsync<ETag>(_host.CatalogDataSource, "a2security.SaveAnalytics", eo, list);
		}
	}
}
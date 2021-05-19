// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

using System;
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
			LoginViewModel model = GetModelFromBody<LoginViewModel>();

			// LOWER CASE!
			model.Name = model.Name.ToLower();
			var user = await UserManager.FindByNameAsync(model.Name);

			// Find by Phone Number
			// await UserManager.FindAsync(new UserLoginInfo("PhoneNumber", model.Name));

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
				if (key == LOCALE_COOKIE)
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

			if (User.Identity.IsAuthenticated)
			{
				AuthenticationManager.SignOut(DefaultAuthenticationTypes.ApplicationCookie);
				Session.Abandon();
				ClearAllCookies();
			}

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
					// email confirmation link?
					// String confirmCode = await UserManager.GenerateEmailConfirmationTokenAsync(user.Id);

					String confirmCode = await UserManager.GenerateTwoFactorTokenAsync(user.Id, AppUserManager.TWOFACTORPROVIDERS.EMailCode);

					//var callbackUrl = Url.Action("confirmemail", "account", new { userId = user.Id, code = confirmCode }, Request.Url.Scheme);

					String subject = _localizer.Localize(null, "@[ConfirmEMail]");
					String body = GetEMailBody("confirmemail", "@[ConfirmEMailBody]")
						.Replace("{0}", confirmCode);

					await UserManager.SendEmailAsync(user.Id, subject, body);

					await SaveReferral(user.Id, model.Referral);
					SaveDDOSTime();

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



		// POST: /Account/ConfirmEmail
		[OutputCache(Duration = 0)]
		[ActionName("confirmemail")]
		[HttpPost]
		[IsAjaxOnly]
		[AllowAnonymous]
		[ValidateJsonAntiForgeryToken]
		[HandlAntiForgeryExecptionAttribute]
		public async Task<ActionResult> ConfirmEmail()
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
			}
			catch (Exception ex)
			{
				// TODO: log error here!
				status= ex.Message;
			}
			return Json(new { Status = status });
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
			if (body.IndexOf("{0}") == -1)
				throw new InvalidProgramException($"Invalid email template for {code}");
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
	}
}
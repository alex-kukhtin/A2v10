// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Web;
using System.Web.Mvc;

using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin.Security;


namespace A2v10.Web.Identity
{
	public class IdentityController : Controller
	{
		private AppSignInManager _signInManager;
		private AppUserManager _userManager;

		protected IdentityController()
		{

		}

		protected IdentityController(AppUserManager userManager, AppSignInManager signInManager)
		{
			UserManager = userManager;
			SignInManager = signInManager;
		}

		public AppSignInManager SignInManager
		{
			get
			{
				return _signInManager ?? HttpContext.GetOwinContext().Get<AppSignInManager>();
			}
			private set
			{
				_signInManager = value;
			}
		}

		public AppUserManager UserManager
		{
			get
			{
				return _userManager ?? HttpContext.GetOwinContext().GetUserManager<AppUserManager>();
			}
			private set
			{
				_userManager = value;
			}
		}

		public Int64 UserId => User.Identity.GetUserId<Int64>();
		public Int32 TenantId => User.Identity.GetUserTenantId();

		protected IAuthenticationManager AuthenticationManager => HttpContext.GetOwinContext().Authentication;


		protected override void Dispose(Boolean disposing)
		{
			if (disposing)
			{
				if (_userManager != null)
				{
					_userManager.Dispose();
					_userManager = null;
				}

				if (_signInManager != null)
				{
					_signInManager.Dispose();
					_signInManager = null;
				}
			}

			base.Dispose(disposing);
		}

	}
}

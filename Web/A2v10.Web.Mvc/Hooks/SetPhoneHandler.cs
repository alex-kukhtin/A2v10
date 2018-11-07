// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Threading.Tasks;
using System.Web;

using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin;

using A2v10.Infrastructure;
using A2v10.Web.Identity;
using A2v10.Data.Interfaces;

namespace A2v10.Web.Mvc.Hooks
{
	public class IdentityMessageWithUserId : IdentityMessage, IUserId
	{
		public Int64 UserId { get; set; }
	}

	public class SendVerifyCodeSmsHandler : IInvokeTarget
	{
		IApplicationHost _host;
		readonly IOwinContext _context;
		readonly AppUserManager _userManager;

		public SendVerifyCodeSmsHandler()
		{
			_host = null;
			_context = HttpContext.Current.GetOwinContext();
			_userManager = _context.GetUserManager<AppUserManager>();
		}

		public void Inject(IApplicationHost host)
		{
			_host = host;
		}

		public async Task<Object> InvokeAsync(Int64 UserId, String PhoneNumber)
		{
			var userByPhone = await _userManager.FindAsync(new UserLoginInfo("PhoneNumber", PhoneNumber));
			if (userByPhone != null && userByPhone.Id != UserId)
			{
				return "phoneAlreadyTaken";
			}

			String code = await _userManager.GenerateChangePhoneNumberTokenAsync(UserId, PhoneNumber);
			if (_userManager.SmsService == null)
				throw new ArgumentNullException("UserManager.SmsService");

			var message = new IdentityMessageWithUserId
			{
				Destination = PhoneNumber,
				Body = "Your security code is: " + code,
				UserId = UserId
			};
			try
			{
				await _userManager.SmsService.SendAsync(message);
			}
			catch (Exception ex)
			{
				if (ex.InnerException != null)
					ex = ex.InnerException;
				return $"error:{ex.Message}";
			}
			return "success";
		}
	}

	public class SetPhoneNumberHandler : IInvokeTarget
	{
		IApplicationHost _host;
		IDbContext _dbContext;
		readonly IOwinContext _context;
		readonly AppUserManager _userManager;

		public SetPhoneNumberHandler()
		{
			_host = null;
			_context = HttpContext.Current.GetOwinContext();
			_userManager = _context.GetUserManager<AppUserManager>();
		}

		public void Inject(IApplicationHost host, IDbContext dbContext)
		{
			_host = host;
			_dbContext = dbContext;
		}

		public async Task<Object> InvokeAsync(Int64 UserId, String PhoneNumber, String Code)
		{
			var result = await _userManager.ChangePhoneNumberAsync(UserId, PhoneNumber, Code);
			if (result.Succeeded)
			{
				var user = await _userManager.FindByIdAsync(UserId);
				await _userManager.UpdateAsync(user);
				return "success";
			}
			return String.Join(", ", result.Errors);
		}
	}
}

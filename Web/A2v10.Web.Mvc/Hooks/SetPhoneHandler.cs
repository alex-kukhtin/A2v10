using System;
using System.Threading.Tasks;
using System.Web;
using A2v10.Infrastructure;
using A2v10.Web.Mvc.Identity;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin;

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
			String code = await _userManager.GenerateChangePhoneNumberTokenAsync(UserId, PhoneNumber);
			if (_userManager.SmsService == null)
				throw new ArgumentNullException("UserManager.SmsService");

			var message = new IdentityMessageWithUserId
			{
				Destination = PhoneNumber,
				Body = "Your security code is: " + code,
				UserId = UserId
			};
			await _userManager.SmsService.SendAsync(message);
			return "success";
		}
	}

	public class SetPhoneNumberHandler : IInvokeTarget
	{
		IApplicationHost _host;
		readonly IOwinContext _context;
		readonly AppUserManager _userManager;

		public SetPhoneNumberHandler()
		{
			_host = null;
			_context = HttpContext.Current.GetOwinContext();
			_userManager = _context.GetUserManager<AppUserManager>();
		}

		public void Inject(IApplicationHost host)
		{
			_host = host;
		}

		public async Task<Object> InvokeAsync(Int64 UserId, String PhoneNumber, String Code)
		{
			await _userManager.ChangePhoneNumberAsync(UserId, PhoneNumber, Code);
			var user = await _userManager.FindByIdAsync(UserId);
			await _userManager.UpdateAsync(user);
			return "success";
		}
	}
}

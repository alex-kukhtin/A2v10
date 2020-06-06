// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Web;
using System.Dynamic;
using System.Threading.Tasks;
using System.Security;

using Microsoft.Owin;
using Microsoft.AspNet.Identity.Owin;

using A2v10.Infrastructure;
using A2v10.Web.Identity;

namespace A2v10.Web.Mvc.Hooks
{
	public class SetPasswordHandler : IModelHandler
	{
		IApplicationHost _host;
		readonly IOwinContext _context;
		readonly AppUserManager _userManager;

		public SetPasswordHandler()
		{
			_context = HttpContext.Current.GetOwinContext();
			_userManager = _context.GetUserManager<AppUserManager>();
		}

		public void Inject(IApplicationHost host)
		{
			_host = host;
		}

		public async Task<Boolean> BeforeSave(Int64 UserId, Object beforeData)
		{
			var before = beforeData as ExpandoObject;

			var userId = before.Eval<Int64>("User.Id");
			var pwd = before.Eval<String>("User.Password");

			var token = await _userManager.GeneratePasswordResetTokenAsync(userId);
			var ir = await _userManager.ResetPasswordAsync(userId, token, pwd);
			if (!ir.Succeeded)
			{
				String errors = String.Empty;
				foreach (var e in ir.Errors)
					errors += "\n" + e;
				throw new SecurityException("Set password failed." + errors);
			}
			var user = await _userManager.FindByIdAsync(userId);
			await _userManager.UpdateAsync(user);
			return true;
		}

		public Task AfterSave(Int64 UserId, Object beforeData, Object afterData)
		{
			return Task.CompletedTask;
		}

	}
}

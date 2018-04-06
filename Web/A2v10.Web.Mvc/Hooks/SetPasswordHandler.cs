// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Web;
using System.Dynamic;
using System.Threading.Tasks;
using System.Security;

using Microsoft.Owin;
using Microsoft.AspNet.Identity.Owin;

using A2v10.Infrastructure;
using A2v10.Web.Mvc.Identity;

namespace A2v10.Web.Mvc.Hooks
{
	public class SetPasswordHandler : IModelHandler
	{
		IApplicationHost _host;
		IOwinContext _context;
		AppUserManager _userManager;
		public SetPasswordHandler(IApplicationHost host)
		{
			_host = host;
			_context = HttpContext.Current.GetOwinContext();
			_userManager = _context.GetUserManager<AppUserManager>();
		}

		public async Task AfterSave(Object beforeData, Object afterData)
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
		}
	}
}

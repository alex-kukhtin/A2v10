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
	public class CreateUserHandler : IModelHandler
	{
		private IApplicationHost _host;
		readonly IOwinContext _context;
		readonly AppUserManager _userManager;

		public CreateUserHandler()
		{
			_context = HttpContext.Current.GetOwinContext();
			_userManager = _context.GetUserManager<AppUserManager>();
		}

		public void Inject(IApplicationHost host)
		{
			_host = host;
		}

		public Task<Boolean> BeforeSave(Object beforeData)
		{
			return Task.FromResult(false);
		}

		public async Task AfterSave(Object beforeData, Object afterData)
		{
			var before = beforeData as ExpandoObject;
			var after = afterData as ExpandoObject;

			var userId = after.Eval<Int64>("User.Id");
			var pwd = before.Eval<String>("User.Password");
			String tenantRoles = null;
			if (_host.IsMultiTenant)
			{
				tenantRoles = before.Eval<String>("User.TenantRoles");
				var afterUser = after.Get<ExpandoObject>("User");
				afterUser.Set("TenantRoles", tenantRoles);
			}

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
			user.EmailConfirmed = true;
			if (tenantRoles != null)
				user.TenantRoles = tenantRoles;
			user.SetModified(UserModifiedFlag.EmailConfirmed);
			await _userManager.UpdateAsync(user);
		}
	}
}

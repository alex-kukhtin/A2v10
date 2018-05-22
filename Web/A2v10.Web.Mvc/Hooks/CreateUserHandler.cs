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
	public class CreateUserHandler : IModelHandler
	{
		readonly IApplicationHost _host;
		readonly IOwinContext _context;
		readonly AppUserManager _userManager;
		public CreateUserHandler(IApplicationHost host)
		{
			_host = host;
			_context = HttpContext.Current.GetOwinContext();
			_userManager = _context.GetUserManager<AppUserManager>();
		}

		public async Task AfterSave(Object beforeData, Object afterData)
		{
			var before = beforeData as ExpandoObject;
			var after = afterData as ExpandoObject;

			var userId = after.Eval<Int64>("User.Id");
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

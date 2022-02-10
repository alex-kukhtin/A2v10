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
using A2v10.Data.Interfaces;

namespace A2v10.Web.Mvc.Hooks
{
	public class CreateTenantUserHandler : IInvokeTarget
	{
		private IApplicationHost _host;
		private IDbContext _dbContext;

		readonly IOwinContext _context;
		readonly AppUserManager _userManager;

		public CreateTenantUserHandler()
		{
			_context = HttpContext.Current.GetOwinContext();
			_userManager = _context.GetUserManager<AppUserManager>();
		}

		public void Inject(IApplicationHost host, IDbContext dbContext)
		{
			_host = host;
			_dbContext = dbContext;
		}

		public async Task<Object> InvokeAsync(Int32 TenantId, Int64 UserId, Int64 Id, ExpandoObject User)
		{
			if (!_host.IsMultiTenant)
				throw new InvalidOperationException("CreateTenantUserHandleris available only in multitenant environment");

			User.Set("Tenant", TenantId);
			await _dbContext.ExecuteExpandoAsync(_host.CatalogDataSource, "a2security.[CreateUserSimple]", User);
			Int64 userId = User.Get<Int64>("Id");

			var token = await _userManager.GeneratePasswordResetTokenAsync(userId);
			var identityResult = await _userManager.ResetPasswordAsync(userId, token, User.Get<String>("Password"));
			if (!identityResult.Succeeded)
				throw new InvalidOperationException(String.Join(",", identityResult.Errors));
			var newAppUser = await _userManager.FindByIdAsync(userId);
			await _dbContext.ExecuteAsync<AppUser>(_host.TenantDataSource, "a2security.CreateTenantUser", newAppUser);

			var result = new ExpandoObject();
			result.Set("Id", userId);

			return result;
		}
	}
}

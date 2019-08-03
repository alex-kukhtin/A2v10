// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Threading.Tasks;
using System.Web;

using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin;

using A2v10.Infrastructure;
using A2v10.Web.Identity;
using A2v10.Data.Interfaces;

namespace A2v10.Web.Mvc.Hooks
{

	class DeleteTenantUserParams
	{
		public Int32 TenantId { get; set; }
		public Int64 UserId { get; set; }
		public Int64 Id { get; set; }
	}

	class DeleteTeanantUserResult
	{
		public String status { get; set; }
		public String message { get; set; }
	}

	public class DeleteTenantUserHandler : IInvokeTarget
	{
		IApplicationHost _host;
		IDbContext _dbContext;
		readonly IOwinContext _context;
		readonly AppUserManager _userManager;

		public DeleteTenantUserHandler()
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

		public async Task<Object> InvokeAsync(Int64 UserId, Int64 Id)
		{
			if (!_host.IsMultiTenant)
				throw new InvalidOperationException("DeleteTenantUser is available only in multitenant environment");
			var prms = new DeleteTenantUserParams() {
				UserId  = UserId, 
				Id = Id,
				TenantId = _host.TenantId ?? 0
			};
			var appUser = new AppUser()
			{
				Id = Id,
				Tenant = _host.TenantId ?? 0,
				CurrentUser = UserId
			};
			var result = new DeleteTeanantUserResult(); 
			try
			{
				await _dbContext.ExecuteAsync<DeleteTenantUserParams>(_host.TenantDataSource, "a2security_tenant.[DeleteUser]", prms);
				await _userManager.DeleteAsync(appUser);
				result.status = "success";
			}
			catch (Exception ex)
			{
				result.status = "error";
				if (_host.IsDebugConfiguration)
					result.message = ex.Message;
				else
					result.message = "Unable to delete user";
			}
			return result;
		}
	}
}

// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Threading.Tasks;
using System.Web;
using System.Transactions;

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
#pragma warning disable IDE1006 // Naming Styles
		public String status { get; set; }
		public String message { get; set; }
#pragma warning restore IDE1006 // Naming Styles
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

		public Object Invoke(Int64 UserId, Int64 Id)
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

			void ExecuteSql()
			{
				_dbContext.Execute<DeleteTenantUserParams>(_host.TenantDataSource, "a2security_tenant.[DeleteUser]", prms);
				_dbContext.Execute<DeleteTenantUserParams>(_host.CatalogDataSource, "a2security.[DeleteTeanatUser]", prms);
				//await _userManager.DeleteAsync(appUser);

				if (_host.IsMultiCompany && _host.IsMultiTenant)
				{
					var update = new UpdateTenantCompanyHandler();
					update.Inject(_host, _dbContext);
					update.EnableThrow();
					update.DisableDtc();
					update.Invoke(UserId, 0);
				}
			}

			try
			{
				if (_host.IsDTCEnabled)
				{
					// distributed transaction!!!!
					using (var trans = new TransactionScope(TransactionScopeOption.RequiresNew))
					{
						ExecuteSql();
						trans.Complete();
					}
				}
				else
				{
					ExecuteSql();
				}
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

// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using System;
using System.Web;

using Microsoft.Owin;

using A2v10.Infrastructure;
using A2v10.Data.Interfaces;
using System.Transactions;

namespace A2v10.Web.Mvc.Hooks
{

	class DeleteTenantCompanyParams
	{
		public Int32 TenantId { get; set; }
		public Int64 UserId { get; set; }
		public Int64 CompanyId { get; set; }
	}

	public class DeleteTenantCompanyHandler : IInvokeTarget
	{
		IApplicationHost _host;
		IDbContext _dbContext;
		readonly IOwinContext _context;

		public DeleteTenantCompanyHandler()
		{
			_host = null;
			_context = HttpContext.Current.GetOwinContext();
		}

		public void Inject(IApplicationHost host, IDbContext dbContext)
		{
			_host = host;
			_dbContext = dbContext;
		}

		public Object Invoke(Int64 UserId, Int64 Id)
		{
			if (!_host.IsMultiTenant)
				throw new InvalidOperationException("DeleteTenantCompany is available only in multitenant environment");
			if (!_host.IsMultiCompany)
				throw new InvalidOperationException("DeleteTenantCompany is available only in multicompany environment");

			var prms = new DeleteTenantCompanyParams() {
				UserId  = UserId, 
				CompanyId = Id,
				TenantId = _host.TenantId ?? -1
			};

			var result = new TeanantResult();

			void ExecuteSql()
			{
				var tenantCompanyInfo = _dbContext.ExecuteAndLoad<DeleteTenantCompanyParams, TenantCompanyInfo>(_host.TenantDataSource, "a2security_tenant.[DeleteCompany]", prms);

				tenantCompanyInfo.UserId = UserId;
				tenantCompanyInfo.TenantId = _host.TenantId ?? -1;

				_dbContext.Execute<TenantCompanyInfo>(_host.CatalogDataSource, "a2security.[UpdateTenantCompanies]", tenantCompanyInfo);
				result.status = "success";
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
			}
			catch (Exception ex)
			{
				result.status = "error";
				if (_host.IsDebugConfiguration)
					result.message = ex.Message;
				else
					result.message = "Unable to delete company";
			}
			return result;
		}
	}
}

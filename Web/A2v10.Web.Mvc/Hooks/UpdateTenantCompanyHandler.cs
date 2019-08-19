// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using System;

using A2v10.Infrastructure;
using A2v10.Data.Interfaces;
using System.Transactions;

namespace A2v10.Web.Mvc.Hooks
{
	public class UpdateTenantCompanyHandler : IInvokeTarget
	{
		IApplicationHost _host;
		IDbContext _dbContext;

		public UpdateTenantCompanyHandler()
		{
			_host = null;
			_dbContext = null;
		}

		public void Inject(IApplicationHost host, IDbContext dbContext)
		{
			_host = host;
			_dbContext = dbContext;
		}

		public Object Invoke(Int64 UserId, Int64 Id)
		{
			if (!_host.IsMultiTenant)
				throw new InvalidOperationException("UpdateTenantCompany is available only in multitenant environment");
			if (!_host.IsMultiCompany)
				throw new InvalidOperationException("UpdateTenantCompany is available only in multicompany environment");

			var prms = new TenantParams() {
				UserId  = UserId, 
				TenantId = _host.TenantId ?? -1
			};

			var result = new TeanantResult();

			void ExecuteSql()
			{
				var tenantCompanyInfo = _dbContext.ExecuteAndLoad<TenantParams, TenantCompanyInfo>(_host.TenantDataSource, "a2security_tenant.GetCompaniesInfo", prms);

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
					result.message = "Unable to update company";
			}
			return result;
		}
	}
}

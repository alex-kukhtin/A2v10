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
		Boolean _enableThrow;

		Boolean _enableDtc;

		public UpdateTenantCompanyHandler()
		{
			_host = null;
			_dbContext = null;
			_enableThrow = false;
			_enableDtc = true;
		}

		public void EnableThrow()
		{
			_enableThrow = true;
		}

		public void DisableDtc()
		{
			_enableDtc = false;
		}

		public void Inject(IApplicationHost host, IDbContext dbContext)
		{
			_host = host;
			_dbContext = dbContext;
		}

		public Object Invoke(Int64 UserId, Int64 Id)
		{
			if (!_host.IsMultiTenant || !_host.IsMultiCompany)
				throw new InvalidOperationException("UpdateTenantCompany is available only in multitenant environment");

			var prms = new TenantParams() {
				UserId  = UserId, 
				TenantId = _host.TenantId ?? -1
			};

			var result = new TeanantResult();

			void ExecuteSql()
			{
				var dm = _dbContext.LoadModel(_host.TenantDataSource, "a2security_tenant.GetCompaniesInfo", prms);
				_dbContext.SaveModel(_host.CatalogDataSource, "a2security.[Tenant.Companies.Update]", dm.Root, prms);
				result.status = "success";
			}

			try
			{
				if (_host.IsDTCEnabled && _enableDtc)
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
				if (_enableThrow)
					throw ex;
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

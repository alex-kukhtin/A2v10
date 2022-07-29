// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using System;
using System.Transactions;
using System.Threading.Tasks;

using A2v10.Infrastructure;
using A2v10.Data.Interfaces;
using System.Dynamic;

namespace A2v10.Web.Mvc.Hooks
{
	public class CreateTenantCompanyHandler : ClrApiHandlerBase, IApiClrHandler
	{
		private readonly IApplicationHost _host;
		private readonly IDbContext _dbContext;

		public CreateTenantCompanyHandler(IServiceLocator services)
		{
			_host = services.GetService<IApplicationHost>();
			_dbContext = services.GetService<IDbContext>();
		}

		public async Task<IApiResponse> HandleAsync(IApiRequest request)
		{
			if (!_host.IsMultiTenant || !_host.IsMultiCompany)
				throw new InvalidOperationException("CreateTenantCompany is available only in multitenant environment");
			Guid tenantId = request.Body.Get<Guid>("tenantId");
			var prms = new ExpandoObject()
			{
				{ "ApiTenantId", tenantId },
			};
			var realUser = await _dbContext.LoadAsync<CreateTenantCompanyHandler>(_host.CatalogDataSource, "a2securityTena", prms);

			var dm = await _dbContext.LoadModelAsync(_host.TenantDataSource, "a2security_tenant.GetCompaniesInfo", prms);
			_dbContext.SaveModel(_host.CatalogDataSource, "a2security.[Tenant.Companies.Update]", dm.Root, prms);
			return Ok();
		}

		/*
		public Object Invoke(Int64 UserId, Int64 Id)
		{
			if (!_host.IsMultiTenant || !_host.IsMultiCompany)
				throw new InvalidOperationException("CreateTenantCompany is available only in multitenant environment");

			var prms = new TenantParams() {
				UserId  = UserId, 
				TenantId = _host.TenantId ?? -1
			};
		}
		*/
	}
}

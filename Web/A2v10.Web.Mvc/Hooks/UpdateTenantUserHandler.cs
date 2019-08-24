// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using System;
using System.Web;
using System.Dynamic;
using System.Threading.Tasks;

using Microsoft.Owin;
using Microsoft.AspNet.Identity.Owin;

using A2v10.Infrastructure;
using A2v10.Web.Identity;
using A2v10.Data.Interfaces;
using Newtonsoft.Json;

namespace A2v10.Web.Mvc.Hooks
{
	public class UpdateTenantUserHandler : IModelHandler
	{
		private IApplicationHost _host;
		private IDbContext _dbContext;
		readonly IOwinContext _context;
		readonly AppUserManager _userManager;

		public UpdateTenantUserHandler()
		{
			_context = HttpContext.Current.GetOwinContext();
			_userManager = _context.GetUserManager<AppUserManager>();
		}

		public void Inject(IApplicationHost host, IDbContext dbContext)
		{
			_host = host;
			_dbContext = dbContext;
		}

		public Task<Boolean> BeforeSave(Object beforeData)
		{
			return Task.FromResult(false);
		}

		public async Task AfterSave(Object beforeData, Object afterData)
		{
			var before = beforeData as ExpandoObject;

			String json = JsonConvert.SerializeObject(before.Get<Object>("User"));
			var appUser = JsonConvert.DeserializeObject<AppUser>(json);
			appUser.Tenant = _host.TenantId ?? 0;
			await _dbContext.ExecuteAsync<AppUser>(_host.TenantDataSource, "a2security.UpdateTenantUser", appUser);
		}
	}
}

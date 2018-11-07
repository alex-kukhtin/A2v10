// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Threading.Tasks;
using System.Web;
using System.Dynamic;

using Microsoft.Owin;
using Microsoft.AspNet.Identity.Owin;

using A2v10.Infrastructure;
using A2v10.Web.Identity;
using System.Security.Claims;
using A2v10.Data.Interfaces;

namespace A2v10.Web.Mvc.Hooks
{
	public class SetPersonNameHandler : IModelHandler
	{
		private readonly IOwinContext _context;
		private readonly AppUserManager _userManager;
		private readonly AppSignInManager _signInManager;

		private IApplicationHost _host;
		private IDbContext _dbContext;

		public SetPersonNameHandler()
		{
			_context = HttpContext.Current.GetOwinContext();
			_userManager = _context.GetUserManager<AppUserManager>();
			_signInManager = _context.GetUserManager<AppSignInManager>();
		}

		public void Inject(IApplicationHost host, IDbContext dbContext)
		{
			_host = host;
			_dbContext = dbContext;
		}

		public async Task AfterSave(Object beforeData, Object afterData)
		{
			var after = afterData as ExpandoObject;

			var personName = after.Eval<String>("User.PersonName");
			var userId = after.Eval<Int64>("User.Id");


			var identity = HttpContext.Current.User.Identity as ClaimsIdentity;
			var claim = identity.FindFirst("PersonName");
			if (claim != null)
				identity.RemoveClaim(claim);
			identity.AddClaim(new Claim("PersonName", personName));

			if (_host.IsMultiTenant)
			{
				// update user info in tenant
				var appUser = new AppUser
				{
					Tenant = _host.TenantId.Value,
					Id = userId,
					PersonName = personName
				};
				await _dbContext.ExecuteAsync(_host.TenantDataSource, "a2security.UpdatePersonName", appUser);
			}

			_signInManager.AuthenticationManager.SignIn(identity);
		}
	}
}


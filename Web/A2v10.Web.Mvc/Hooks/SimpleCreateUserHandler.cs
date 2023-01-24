// Copyright © 2015-2023 Oleksandr Kukhtin. All rights reserved.

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

namespace A2v10.Web.Mvc.Hooks;

public class SimpleCreateUserHandler : IInvokeTarget
{
	private IApplicationHost _host;
	private IDbContext _dbContext;

	readonly IOwinContext _context;
	readonly AppUserManager _userManager;
	private readonly IOwinRequest _request;

	public SimpleCreateUserHandler()
	{
		_context = HttpContext.Current.GetOwinContext();
		_request = _context.Request;
		_userManager = _context.GetUserManager<AppUserManager>();
	}

	public void Inject(IApplicationHost host, IDbContext dbContext)
	{
		_host = host;
		_dbContext = dbContext;
	}


	public async Task<Object> InvokeAsync(Int32 TenantId, Int64 UserId, Int64 Id, ExpandoObject User)
	{
		var catalogDS = _host.IsMultiTenant ? _host.CatalogDataSource : _host.TenantDataSource;

		var schema = _host.CustomSecuritySchema;
		if (String.IsNullOrEmpty(schema))
			schema = "a2security";
		var appUser = new AppUser()
		{
			UserName = User.Get<String>(nameof(AppUser.UserName)),
			PersonName = User.Get<String>(nameof(AppUser.UserName)),
			PhoneNumber = User.Get<String>(nameof(AppUser.UserName)),
			Email = User.Get<String>(nameof(AppUser.Email)),
			EmailConfirmed = true,
			RegisterHost = _request.Uri.Host,
		};
		appUser.Email = appUser.Email ?? appUser.UserName;
		if (_host.IsMultiTenant)
			appUser.Tenant = TenantId;
		appUser = await _dbContext.ExecuteAndLoadAsync<AppUser, AppUser>(catalogDS, $"{schema}.[User.CreateSimple]", appUser);

		var token = await _userManager.GeneratePasswordResetTokenAsync(appUser.Id);
		var identityResult = await _userManager.ResetPasswordAsync(appUser.Id, token, User.Get<String>("Password"));
		if (!identityResult.Succeeded)
			throw new SecurityException(String.Join(",", identityResult.Errors));
		await _userManager.UpdateAsync(appUser);

		if (_host.IsMultiTenant)
		{
			// Update segment
			appUser.Tenant = TenantId;
			await _dbContext.ExecuteAsync<AppUser>(_host.TenantDataSource, $"{schema}.[User.CreateSimple]", appUser);
		}
		return appUser;
	}
}

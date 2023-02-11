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

/*
ST: SEGMENT: sec.[User.Simple.Create]
	SEGMENT: sec.[UpdateUserPassword]

MT: CATALOG: sec.[User.Simple.Create]
	CATALOG: sec.[UpdateUserPassword]
	SEGMENT: sec.[TenantUser.Simple.Create]
*/

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


	public async Task<Object> InvokeAsync(Int32 TenantId, Int64 UserId, ExpandoObject User)
	{
		var securityDS = _host.IsMultiTenant ? _host.CatalogDataSource : _host.TenantDataSource;

		var schema = _host.ActualSecuritySchema;
		var appUser = new AppUser()
		{
			UserName = User.Get<String>(nameof(AppUser.UserName)),
			PersonName = User.Get<String>(nameof(AppUser.PersonName)),
			PhoneNumber = User.Get<String>(nameof(AppUser.PhoneNumber)),
			Email = User.Get<String>(nameof(AppUser.Email)),
			Memo = User.Get<String>(nameof(AppUser.Memo)),
			EmailConfirmed = true,
			RegisterHost = _request.Uri.Host,
			Locale = User.Get<String>(nameof(AppUser.Locale)),
			Tenant = 1 /* default value */
		};
		appUser.Email ??= appUser.UserName;
		if (_host.IsMultiTenant)
		{
			appUser.Tenant = TenantId;
			appUser.Segment = _request.User.Identity.GetUserSegment();
		}
		appUser = await _dbContext.ExecuteAndLoadAsync<AppUser, AppUser>(securityDS, $"{schema}.[User.Simple.Create]", appUser);

		var token = await _userManager.GeneratePasswordResetTokenAsync(appUser.Id);
		var identityResult = await _userManager.ResetPasswordAsync(appUser.Id, token, User.Get<String>("Password"));
		if (!identityResult.Succeeded)
			throw new SecurityException(String.Join(",", identityResult.Errors));
		await _userManager.UpdateAsync(appUser);

		appUser.PasswordHash = String.Empty;
		appUser.SecurityStamp = String.Empty;

		if (_host.IsMultiTenant)
		{
			// Update segment data source
			appUser.Tenant = TenantId;
			await _dbContext.ExecuteAsync<AppUser>(_host.TenantDataSource, $"{schema}.[TenantUser.Simple.Create]", appUser);
		}
		return appUser;
	}
}

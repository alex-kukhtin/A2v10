// Copyright © 2022 Alex Kukhtin. All rights reserved.

using System;
using System.Web;
using System.Dynamic;
using System.Text;
using System.Threading.Tasks;

using Microsoft.Owin;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.AspNet.Identity;
using Microsoft.Owin.Security.DataProtection;


using A2v10.Infrastructure;
using A2v10.Data.Interfaces;
using A2v10.Web.Identity;
using System.Globalization;
using Microsoft.IdentityModel.Tokens;

namespace A2v10.Web.Mvc.Hooks
{
	public class LoginTenantUserHandler : ClrApiHandlerBase, IApiClrHandler
	{
		private readonly IOwinContext _context;
		private readonly AppUserManager _userManager;
		private readonly IDataProtectionProvider _dataProtectionProvider;

		public LoginTenantUserHandler(IServiceLocator services)
		{
			_context = HttpContext.Current.GetOwinContext();
			_userManager = _context.GetUserManager<AppUserManager>();
			_dataProtectionProvider = services.GetService<IDataProtectionProvider>();
		}

		public async Task<IApiResponse> HandleAsync(IApiRequest request)
		{
			var id = request.Body.Get<String>("id");
			
			if (String.IsNullOrEmpty(id))
				return Fail("id required");
			var user = await _userManager.FindAsync(new UserLoginInfo("ExternalId", id.ToUpperInvariant()));
			if (user == null)
				return Fail("User not found");
			var dp = _dataProtectionProvider.Create("ExternalLogin");
			var data = Encoding.UTF8.GetBytes($"{id.ToUpperInvariant()}\b{DateTime.UtcNow.ToString("o", CultureInfo.InvariantCulture)}");
			var protect = dp.Protect(data);
			var token = Base64UrlEncoder.Encode(protect);
			var url = $"{_context.Request.Uri.Authority}/account/loginext?token={token}";
			var res = new ExpandoObject()
			{
				{"url", url }
			};
			return Ok(res);
		}
	}
}

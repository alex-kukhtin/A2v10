// Copyright © 2022 Alex Kukhtin. All rights reserved.

using System;
using System.Web;
using System.Dynamic;
using System.Threading.Tasks;

using Microsoft.Owin;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.AspNet.Identity;

using A2v10.Infrastructure;
using A2v10.Web.Identity;

namespace A2v10.Web.Mvc.Hooks
{
	public class CreateTenantHandler : ClrApiHandlerBase, IApiClrHandler
	{
		private readonly IOwinContext _context;
		private readonly AppUserManager _userManager;

		public CreateTenantHandler(IServiceLocator services)
		{
			_context = HttpContext.Current.GetOwinContext();
			_userManager = _context.GetUserManager<AppUserManager>();
		}

		public async Task<IApiResponse> HandleAsync(IApiRequest request)
		{
			var phone = request.Body.Get<String>("phone");
			var name = request.Body.Get<String>("name");
			var email = request.Body.Get<String>("email");
			var id = request.Body.Get<String>("id");
			
			if (String.IsNullOrEmpty(id))
				return Fail("id required");
			if (String.IsNullOrEmpty(email))
				return Fail("email required");
			if (String.IsNullOrEmpty(phone))
				return Fail("phone required");
			if (String.IsNullOrEmpty(name))
				return Fail("name required");

			var user = await _userManager.FindByNameAsync(email);
			if (user != null)
				return Fail("Email already taken");
			user = await _userManager.FindAsync(new UserLoginInfo("PhoneNumber", phone));
			if (user != null)
				return Fail("Phone already taken");
			user = new AppUser()
			{
				UserName = email,
				Email = email,
				PhoneNumber = phone,
				PersonName = name,
				Tenant = -1,
			};
			var result = await _userManager.CreateAsync(user);
			if (!result.Succeeded)
			{
				return Fail(String.Join(",", result.Errors));
			}
			await _userManager.AddLoginAsync(user.Id, new UserLoginInfo("ExternalId", id.ToUpperInvariant()));
			user.SetEMailConfirmed();
			await _userManager.UpdateUser(user);
			return Ok();
		}
	}
}

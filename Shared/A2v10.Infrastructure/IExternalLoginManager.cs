// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Threading.Tasks;

namespace A2v10.Infrastructure
{

	public struct ExternalUserInfo
	{
		public String UserName { get; set; }
		public String Email { get; set; }
		public String PhoneNumber { get; set; }
		public String PersonName { get; set; }
		public String ProviderKey { get; set; }
		public String Password { get; set; }
	}

	public interface IExternalLoginManager
	{
		Task<String> GenerateToken(String loginProvider, String providerKey);
		Task<Boolean> SignInUserAsync(String loginProvider, String providerKey, String token, IRequestInfo request);
		Task<Boolean> CreateUserAsync(String loginProvider, ExternalUserInfo user);
		Task<Boolean> IsUserExistsAsync(String loginProvider, String providerKey);
	}
}

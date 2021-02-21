// Copyright © 2021 Alex Kukhtin. All rights reserved.

using System;
using Microsoft.Owin.Security;

namespace A2v10.Web.Identity.ApiKey
{
	public sealed class ApiKeyAuthenticationOptions : AuthenticationOptions
	{
		public ApiKeyAuthenticationOptions(String authenticationType = "ApiKey")
			: base(authenticationType)
		{
			Header = "Authorization";
			Key = "ApiKey";
			UnauthorizedCode = 401;
			Provider = new ApiKeyAuthenticationProvider();
		}

		public ApiKeyAuthenticationProvider Provider { get; set; }

		public String Header { get; set; }
		public String Key { get; set; }
		public Int32 UnauthorizedCode { get; set; }
	}
}

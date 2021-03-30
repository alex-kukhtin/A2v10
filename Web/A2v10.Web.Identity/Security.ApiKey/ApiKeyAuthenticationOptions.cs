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
			UnauthorizedCode = 401;
			Provider = new ApiKeyAuthenticationProvider();
		}

		public ApiKeyAuthenticationProvider Provider { get; set; }

		public Int32 UnauthorizedCode { get; set; }
	}
}

// Copyright © 2021 Alex Kukhtin. All rights reserved.

using System;
using Microsoft.Owin.Security;

namespace A2v10.Web.Identity.ApiBasic
{
	public sealed class ApiBasicAuthenticationOptions : AuthenticationOptions
	{
		public ApiBasicAuthenticationOptions(String authenticationType = "Basic")
			: base(authenticationType)
		{
			UnauthorizedCode = 401;
			Provider = new ApiBasicAuthenticationProvider()
			{
				OnValidateIdentity = (context) => DbValidateApiBasic.ValidateBasic(context)
			};
		}

		public ApiBasicAuthenticationProvider Provider { get; set; }

		public Int32 UnauthorizedCode { get; set; }
	}
}

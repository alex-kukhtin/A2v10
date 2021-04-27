// Copyright © 2021 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Security.Claims;
using Microsoft.Owin;

namespace A2v10.Web.Identity.ApiBasic
{
	public class ApiBasicValidateIdentityContext
	{
		public ApiBasicValidateIdentityContext(IOwinContext context, ApiBasicAuthenticationOptions options, String clientId, String clientSecret, String host)
		{
			Options = options;
			ClientId = clientId;
			ClientSecret = ClientSecret;
			Host = host;
		}

		public ApiBasicAuthenticationOptions Options { get; }
		public String Host { get; }
		public String ClientId { get; }
		public String ClientSecret { get; }

		public IEnumerable<Claim> Claims { get; set; }

		public Boolean IsValidated { get; set; }
	}
}

// Copyright © 2021 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Security.Claims;
using Microsoft.Owin;

namespace A2v10.Web.Identity.ApiKey
{
	public class ApiKeyValidateIdentityContext
	{
		public ApiKeyValidateIdentityContext(IOwinContext context, ApiKeyAuthenticationOptions options, String apiKey, String host)
		{
			Options = options;
			ApiKey = apiKey;
			Host = host;
		}

		public ApiKeyAuthenticationOptions Options { get; }
		public String Host { get; }
		public String ApiKey { get; }

		public IEnumerable<Claim> Claims { get; set; }

		public Boolean IsValidated { get; set; }
	}
}

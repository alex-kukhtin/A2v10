// Copyright © 2021 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Security.Claims;
using Microsoft.Owin;

namespace A2v10.Web.Identity.ApiBasic
{
	public class ApiBasicValidateIdentityContext
	{
		public ApiBasicValidateIdentityContext(IOwinContext context, ApiBasicAuthenticationOptions options, String user, String password, String host)
		{
			Options = options;
			User = user;
			Password = password;
			Host = host;
		}

		public ApiBasicAuthenticationOptions Options { get; }
		public String Host { get; }
		public String User { get; }
		public String Password { get; }

		public IEnumerable<Claim> Claims { get; set; }

		public Boolean IsValidated { get; set; }
	}
}

using Microsoft.Owin.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Web.Identity.ApiKey
{
	public sealed class ApiKeyAuthenticationOptions : AuthenticationOptions
	{
		public ApiKeyAuthenticationOptions(String authenticationType = "ApiKey")
			: base(authenticationType)
		{
			Header = "Authorization";
			Key = "ApiKey";
			Provider = new ApiKeyAuthenticationProvider();
		}

		public ApiKeyAuthenticationProvider Provider { get; set; }

		public String Header { get; set; }
		public String Key { get; set; }
	}
}

// Copyright © 2021 Alex Kukhtin. All rights reserved.

using System;
using System.Threading.Tasks;

namespace A2v10.Web.Identity.ApiKey
{
	public class ApiKeyAuthenticationProvider
	{
		public Func<ApiKeyValidateIdentityContext, Task> OnValidateIdentity { get; set; }

		public virtual async Task ValidateIdentity(ApiKeyValidateIdentityContext context)
		{
			if (OnValidateIdentity == null)
				throw new ArgumentNullException(nameof(OnValidateIdentity));

			await OnValidateIdentity(context);
		}
	}
}

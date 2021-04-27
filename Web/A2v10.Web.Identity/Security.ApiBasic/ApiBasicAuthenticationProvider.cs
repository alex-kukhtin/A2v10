// Copyright © 2021 Alex Kukhtin. All rights reserved.

using System;
using System.Threading.Tasks;

namespace A2v10.Web.Identity.ApiBasic
{
	public class ApiBasicAuthenticationProvider
	{
		public Func<ApiBasicValidateIdentityContext, Task> OnValidateIdentity { get; set; }

		public virtual async Task ValidateIdentity(ApiBasicValidateIdentityContext context)
		{
			if (OnValidateIdentity == null)
				throw new ArgumentNullException(nameof(OnValidateIdentity));

			await OnValidateIdentity(context);
		}
	}
}

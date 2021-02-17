// Copyright © 2020-2021 Alex Kukhtin. All rights reserved.

using System;

using A2v10.Infrastructure;
using A2v10.Web.Identity.ApiKey;

namespace A2v10.Web.Mvc.Hooks
{

	public class GenerateApiKey : IInvokeTarget
	{

		public void Inject()
		{
		}

		public Object Invoke(Int64 UserId)
		{
			String apiKey = ApiKeyGenerator.GenerateKey();
			return new { Result = apiKey };
		}
	}
}

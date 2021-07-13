// Copyright © 2021 Alex Kukhtin. All rights reserved.

using Newtonsoft.Json;
using System;

namespace A2v10.Web.Identity
{
	public class OpenIdConfig
	{
		public String clientId { get; set; }
		public String aadInstance { get; set; }
		public String domain { get; set; }
		public String tenantId { get; set; }
		public String redirectUri { get; set; }

		private OpenIdConfig()
		{
		}

		public static OpenIdConfig FromString(String settings)
		{
			var openIdConfig = JsonConvert.DeserializeObject<OpenIdConfig>(settings);
			openIdConfig.Normalize();
			return openIdConfig;
		}

		void Normalize()
		{
			if (redirectUri == null)
				redirectUri = String.Empty;
			if (!redirectUri.EndsWith("/", StringComparison.Ordinal))
				redirectUri += "/";
		}
	}
}

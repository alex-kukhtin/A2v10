// Copyright © 2021 Alex Kukhtin. All rights reserved.

using Newtonsoft.Json;
using System;

namespace A2v10.Web.Identity;

public class OpenIdConfig
{
#pragma warning disable IDE1006 // Naming Styles
    public String clientId { get; set; }
	public String aadInstance { get; set; }
	public String domain { get; set; }
	public String tenantId { get; set; }
	public String redirectUri { get; set; }
#pragma warning restore IDE1006 // Naming Styles

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
		redirectUri ??= String.Empty;
		if (!redirectUri.EndsWith("/", StringComparison.Ordinal))
			redirectUri += "/";
	}
}

// Copyright © 2020-2022 Alex Kukhtin. All rights reserved.

using System;
using System.Web;

using Microsoft.Owin;

using A2v10.Infrastructure;

namespace A2v10.Web.Mvc;

public static class RequestExtensions
{
	public static String GetSiteMetaTags(this HttpRequestBase Request, IApplicationHost appHost)
	{
		var host = Request.Headers["Host"];
		if (host == null)
			return String.Empty;
		Int32 dotPos = host.IndexOfAny(":".ToCharArray());
		if (dotPos != -1)
			host = host.Substring(0, dotPos);
		host = host.Replace('.', '_').ToLowerInvariant();
		String metaText = appHost.ApplicationReader.ReadTextFile("_meta/", $"{host}.head");
		if (metaText != null)
			return metaText;
		return String.Empty;
	}

	public static Boolean SkipAuthRedirect(this IOwinRequest request)
	{
		if (request.Path.StartsWithSegments(new PathString("/api/v2")))
			return true;
		if (request.Headers["X-Requested-With"] == "XMLHttpRequest")
			return true;
		return false;

	}
}

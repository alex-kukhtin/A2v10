// Copyright © 2020-2022 Alex Kukhtin. All rights reserved.

using System;
using System.Web;

using Microsoft.Owin;

using A2v10.Infrastructure;
using A2v10.Request;

namespace A2v10.Web.Mvc;

public static class RequestExtensions
{
	public static String GetSiteMetaTags(this HttpRequestBase Request, IApplicationHost appHost)
	{
		var host = Request.Headers["Host"];
		if (host == null)
			return String.Empty;
		return appHost.GetSiteMetaTags(host);
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

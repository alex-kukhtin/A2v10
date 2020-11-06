// Copyright © 2020 Alex Kukhtin. All rights reserved.

using System;
using System.Web;

using A2v10.Infrastructure;

namespace A2v10.Web.Mvc
{
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
	}
}

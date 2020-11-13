// Copyright © 2020 Alex Kukhtin. All rights reserved.

using System;
using System.Security.Cryptography;
using System.Text;
using System.Web;

using Microsoft.AspNet.Identity;

using A2v10.Data.Interfaces;

namespace A2v10.Web.Mvc.Startup
{
	// COPY/PASTE from A2v10.Web.Mvc.Start.WebTokenProvider!
	public class WebTokenProvider : ITokenProvider
	{
		public String GenerateToken(Guid accessToken)
		{
			var context = HttpContext.Current;
			var sessionId = context.Session.SessionID;
			var userId = context.User.Identity.GetUserId<Int64>();
			if (accessToken == null)
				throw new InvalidProgramException("AccessToken for GenerateToken is empty");
			String key = $":{sessionId}:{accessToken}:{userId}:";
			using (var algo = SHA256.Create())
			{
				var hash = algo.ComputeHash(Encoding.UTF8.GetBytes(key));
				return HttpServerUtility.UrlTokenEncode(hash);
			}
		}
	}
}

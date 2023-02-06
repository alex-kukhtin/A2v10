// Copyright © 2020-2023 Oleksandr Kukhtin. All rights reserved.

using System;
using System.Web;

namespace A2v10.Request;


public partial class BaseController
{
	public Boolean IsTokenValid(HttpResponseBase response, Guid dbToken, String requestToken)
	{
		if (_tokenProvider == null)
			return true;
		var genToken = _tokenProvider.GenerateToken(dbToken);
		if (requestToken != genToken)
		{
			response.StatusCode = 403;
			response.ContentType = "text/plain";
			response.Write("Access denied");
			return false;
		}
		return true;
	}
}

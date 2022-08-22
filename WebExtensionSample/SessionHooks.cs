// Copyright © 2022 Alex Kukhtin. All rights reserved.

using System;
using System.Web;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;

using A2v10.Web.Mvc.Interfaces;

namespace WebExtensionSample;

public class ApplicationHooksSample : ISessionHooks
{
	private readonly IDbContext _dbContext;
	public ApplicationHooksSample(IServiceLocator locator)
	{
		_dbContext = locator.GetService<IDbContext>();
	}

	/**
	 * returns: null -> success, message: error
	 */
	public String OnLogin(HttpRequestBase request, HttpResponseBase response, Int64 userId)
	{
		return null; // "Too much sessions";

	}
	public void OnLogout(HttpRequestBase request, Int64 userId)
	{
		//throw new NotImplementedException();
	}

	public Boolean IsSessionValid(HttpRequestBase request, Int64 userId)
	{
		if (request.Url.PathAndQuery == "/_page/purchase/agent/index/0")
			return false;
		return true;
	}
}

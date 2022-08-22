// Copyright © 2022 Alex Kukhtin. All rights reserved.

using System;
using System.Web;

namespace A2v10.Web.Mvc.Interfaces;

public interface ISessionHooks
{
	String OnLogin(HttpRequestBase request, HttpResponseBase response, Int64 UserId);
	void OnLogout(HttpRequestBase request, Int64 UserId);
	Boolean IsSessionValid(HttpRequestBase request, Int64 UserId);
}


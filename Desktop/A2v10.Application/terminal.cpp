// Copyright © 2017-2020 Alex Kukhtin. All rights reserved.


#include "stdafx.h"

#include "terminal.h"
#include "cefapp.h"
#include "callbackmap.h"
#include "A2v10.Application.h"
#include "appconfig.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

CNativeTerminalHandler::CNativeTerminalHandler()
{
}

// virtual 
bool CNativeTerminalHandler::Execute(const CefString& name, CefRefPtr<CefV8Value> object,
	const CefV8ValueList& arguments, CefRefPtr<CefV8Value>& retval, CefString& exception)
{
	retval = CefV8Value::CreateInt(CCefApplication::TerminalId());
	return true;
}
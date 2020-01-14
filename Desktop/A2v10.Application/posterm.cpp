// Copyright © 2017-2020 Alex Kukhtin. All rights reserved.


#include "stdafx.h"

#include "posterm.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

const int CMD_LENGTH = 64;

CNativePosTermHandler::CNativePosTermHandler()
	:_connected(false)
{
}

bool CNativePosTermHandler::NullBill()
{
	return true;
}

bool CNativePosTermHandler::Connect(CefRefPtr<CefV8Value>& opts)
{
	return true;
}

// virtual 
bool CNativePosTermHandler::Execute(const CefString& name, CefRefPtr<CefV8Value> object,
	const CefV8ValueList& arguments, CefRefPtr<CefV8Value>& retval, CefString& exception)
{
	CefRefPtr<CefV8Value> cmd = arguments[1];
	const wchar_t* szCmd = cmd->GetStringValue().c_str();
	bool rc = false;
	if (wcsncmp(szCmd, L"nullbill", CMD_LENGTH) == 0) {
		rc = NullBill();
	}
	else if (wcsncmp(szCmd, L"connect", CMD_LENGTH) == 0) {
		CefRefPtr<CefV8Value> opts = arguments[1];
		rc = Connect(opts);
	}
	retval = CefV8Value::CreateString(rc ? L"success" : L"fail");
	return true;
}


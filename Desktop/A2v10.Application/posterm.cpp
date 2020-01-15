// Copyright © 2017-2020 Alex Kukhtin. All rights reserved.


#include "stdafx.h"

#include "posterm.h"
#include "cefapp.h"
#include "callbackmap.h"
#include "A2v10.Application.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

const int CMD_LENGTH = 64;

const wchar_t* ERR_INVALID_ARGNO = L"invalid number of arguments";

CNativePosTermHandler::CNativePosTermHandler()
{
}
// virtual 
bool CNativePosTermHandler::Execute(const CefString& name, CefRefPtr<CefV8Value> object,
	const CefV8ValueList& arguments, CefRefPtr<CefV8Value>& retval, CefString& exception)
{
	int argSize = arguments.size();
	if (argSize < 3) {
		exception = ERR_INVALID_ARGNO;
		return true;
	}

	CefRefPtr<CefV8Context> context = CefV8Context::GetCurrentContext();
	CefRefPtr<CefBrowser> browser = context->GetBrowser();
	int browser_id = browser->GetIdentifier();

	CefRefPtr<CefV8Value> success = arguments[0];
	CefRefPtr<CefV8Value> fail = arguments[1];
	CefRefPtr<CefV8Value> data = arguments[2];

	CefRefPtr<CefV8Value> global = context->GetGlobal();
	CefRefPtr<CefV8Value> stringify = global->GetValue(L"JSON")->GetValue(L"stringify");
	CefV8ValueList list;
	list.push_back(data);
	auto json = stringify->ExecuteFunction(nullptr, list);

	auto cbMap = CallbackMap::Current();
	int key = cbMap->Add(context, success);

	CefRefPtr<CefProcessMessage> msg = CefProcessMessage::Create(L"pos_src");
	auto argList = msg->GetArgumentList();
	argList->SetInt(0, key);
	argList->SetString(1, json->GetStringValue());
	browser->GetMainFrame()->SendProcessMessage(PID_BROWSER, msg);

	retval = CefV8Value::CreateBool(true);

	return true;
}


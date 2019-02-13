// Copyright © 2017-2019 Alex Kukhtin. All rights reserved.


#include "stdafx.h"

#include "upload.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

CNativeUploadHandler::CNativeUploadHandler()
{
}

// virtual 
bool CNativeUploadHandler::Execute(const CefString& name, CefRefPtr<CefV8Value> object,
	const CefV8ValueList& arguments, CefRefPtr<CefV8Value>& retval, CefString& exception)
{
	retval = CefV8Value::CreateString(L"From Function");
	return true;
}


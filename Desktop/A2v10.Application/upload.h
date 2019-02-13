#pragma once
// Copyright © 2017-2019 Alex Kukhtin. All rights reserved.

#pragma once

class CNativeUploadHandler : public CefV8Handler
{
public:
	CNativeUploadHandler();

	virtual bool Execute(const CefString& name, CefRefPtr<CefV8Value> object, const CefV8ValueList& arguments, CefRefPtr<CefV8Value>& retval, CefString& exception) override;

	IMPLEMENT_REFCOUNTING(CNativeUploadHandler);
};

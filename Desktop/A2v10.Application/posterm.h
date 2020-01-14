// Copyright © 2017-2020 Alex Kukhtin. All rights reserved.

#pragma once

class CNativePosTermHandler : public CefV8Handler
{
public:
	CNativePosTermHandler();

	virtual bool Execute(const CefString& name, CefRefPtr<CefV8Value> object, const CefV8ValueList& arguments, CefRefPtr<CefV8Value>& retval, CefString& exception) override;

	IMPLEMENT_REFCOUNTING(CNativePosTermHandler);
};

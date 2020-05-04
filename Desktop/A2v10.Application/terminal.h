#pragma once

class CNativeTerminalHandler : public CefV8Handler
{
public:
	CNativeTerminalHandler();

	virtual bool Execute(const CefString& name, CefRefPtr<CefV8Value> object, const CefV8ValueList& arguments, CefRefPtr<CefV8Value>& retval, CefString& exception) override;

	IMPLEMENT_REFCOUNTING(CNativeTerminalHandler);
};

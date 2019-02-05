// Copyright © 2017-2019 Alex Kukhtin. All rights reserved.


#include "stdafx.h"

#include "cefapp.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif

// virtual 
void CCefApplication::OnRegisterCustomSchemes(CefRawPtr<CefSchemeRegistrar> registrar)
{
	return;
	registrar->AddCustomScheme("client", 
		true,  /*is_standard*/
		false, /*is_local*/
		false, /*is_display_isolated*/
		false, /*is_secure*/
		false, /*is_cors_enabled*/
		true   /*is_csp_bypassing*/);
}

// static 
void CCefApplication::Init(HINSTANCE hInstance)
{
	CefEnableHighDPISupport();

	CefMainArgs args(hInstance);
	CefSettings settings;
	settings.single_process = true; // TODO: // check ????
	settings.multi_threaded_message_loop = false;
	settings.no_sandbox = true;
	settings.remote_debugging_port = 5555; /// TODO

	static CefRefPtr<CCefApplication> app(new CCefApplication());

	CefInitialize(args, settings, app.get(), nullptr);
}
